# Deployment Guide

ResolveX ships as three containers (backend, frontend, MongoDB) sitting behind a public
Nginx reverse proxy, all orchestrated by `docker-compose.yml`. The steps below are
identical once you have a Linux VM with a public IP — only VM provisioning differs by
cloud provider, so that part is split out below.

---

## 1. Provision a VM

All four options below give you an Ubuntu 22.04 server with a public IP and SSH access.
Pick one, then jump to [Section 2](#2-common-server-setup).

### AWS EC2

1. EC2 → **Launch instance** → Ubuntu Server 22.04 LTS, `t3.small` or larger (2 vCPU / 2GB+ RAM recommended).
2. Create/select a key pair for SSH.
3. Security group: allow inbound **22** (SSH), **80** (HTTP), **443** (HTTPS).
4. Launch, then note the public IPv4 address.
5. `ssh -i your-key.pem ubuntu@<public-ip>`

### IBM Cloud (Virtual Server for VPC)

1. VPC Infrastructure → **Virtual server instances** → Create.
2. Image: Ubuntu 22.04. Profile: `bx2-2x8` or similar.
3. Attach a **Floating IP** so the instance is publicly reachable.
4. Security group rules: allow inbound TCP 22, 80, 443 from `0.0.0.0/0`.
5. `ssh -i your-key.pem root@<floating-ip>`

### Azure VM

1. Azure Portal → **Virtual machines** → Create → Ubuntu Server 22.04 LTS, `Standard_B2s` or larger.
2. Authentication: SSH public key.
3. Inbound port rules: allow SSH (22), HTTP (80), HTTPS (443).
4. Create, then grab the public IP from the VM overview page.
5. `ssh azureuser@<public-ip>`

### DigitalOcean

1. **Create → Droplets** → Ubuntu 22.04, at least the 2GB/1vCPU plan (2GB+ RAM recommended).
2. Add your SSH key during creation.
3. DigitalOcean droplets expose all ports by default; add a Cloud Firewall restricting
   inbound to 22/80/443 if you want tighter security.
4. `ssh root@<droplet-ip>`

---

## 2. Common server setup

Run this on the VM once you're connected via SSH (works the same on all four providers).

### 2.1 Install Docker & Docker Compose

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker   # or log out and back in

docker --version
docker compose version
```

### 2.2 Point your domain at the server

In your DNS provider, create an **A record** for your domain (and `www` subdomain, if
used) pointing at the VM's public IP. Wait for propagation (`dig yourdomain.com` should
return the VM's IP).

### 2.3 Clone the repository

```bash
sudo apt install -y git
git clone <your-repo-url> resolvex
cd resolvex
```

### 2.4 Configure environment variables

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

At minimum, set for production:

- `NODE_ENV=production`
- `JWT_SECRET` — generate a long random value, e.g. `openssl rand -hex 32`
- `CLIENT_URL=https://yourdomain.com`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` — real SMTP credentials
  so verification/reset/notification emails actually send
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — optional;
  without these, uploaded images are stored on a Docker volume on the VM instead

```bash
cp frontend/.env.example frontend/.env
# VITE_API_URL can stay as /api - the bundled Nginx handles routing
```

### 2.5 First build & start

```bash
docker compose up --build -d
docker compose ps          # all services should show "healthy" within ~1 minute
docker compose exec backend npm run seed   # optional - demo accounts and sample data
```

At this point the app is reachable over plain HTTP at `http://yourdomain.com` (or the
server's IP). Continue below to add HTTPS.

---

## 3. SSL with Let's Encrypt

The public Nginx container (`./nginx/conf.d/resolvex.conf`) starts in plain-HTTP mode so
the first `docker compose up` works without any certificates. To add HTTPS:

```bash
# 1. Install certbot on the host (simplest option - avoids extra containers)
sudo apt install -y certbot

# 2. Temporarily stop the nginx container so certbot can bind port 80
docker compose stop nginx

# 3. Request the certificate (replace with your real domain + email)
sudo certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com \
  --agree-tos -m you@yourdomain.com --non-interactive

# Certificates land in /etc/letsencrypt/live/yourdomain.com/
```

Now wire the certs into the Nginx container:

```bash
# 4. Mount the host's /etc/letsencrypt into the nginx service.
#    Edit docker-compose.yml's nginx service volumes to include:
#      - /etc/letsencrypt:/etc/letsencrypt:ro

# 5. Swap in the HTTPS config
cd nginx/conf.d
sudo mv resolvex.conf resolvex-http-only.conf.bak
sudo cp resolvex-ssl.conf.example resolvex.conf
sudo nano resolvex.conf   # replace "yourdomain.com" with your actual domain

cd ../..
docker compose up -d nginx
```

Visit `https://yourdomain.com` to confirm the padlock shows a valid certificate.

### Auto-renewal

Let's Encrypt certificates expire every 90 days. Add a cron job to renew and reload Nginx:

```bash
sudo crontab -e
# Add this line:
0 3 * * * certbot renew --quiet --pre-hook "docker compose -f /home/ubuntu/resolvex/docker-compose.yml stop nginx" --post-hook "docker compose -f /home/ubuntu/resolvex/docker-compose.yml start nginx"
```

(Adjust the path to match where you cloned the repo.)

---

## 4. Automatic restart on reboot / crash

Two layers already handle this:

1. Every service in `docker-compose.yml` is set to `restart: unless-stopped`, so
   containers restart automatically if they crash or the VM reboots — as long as the
   Docker daemon itself starts on boot, which `get.docker.com` enables by default:

   ```bash
   sudo systemctl enable docker
   sudo systemctl status docker   # should show "enabled"
   ```

2. If you'd rather manage the whole stack as a single systemd unit (useful for ordering
   or for platforms where you want `systemctl restart resolvex`), create:

   ```ini
   # /etc/systemd/system/resolvex.service
   [Unit]
   Description=ResolveX Docker Compose stack
   Requires=docker.service
   After=docker.service

   [Service]
   Type=oneshot
   RemainAfterExit=true
   WorkingDirectory=/home/ubuntu/resolvex
   ExecStart=/usr/bin/docker compose up -d
   ExecStop=/usr/bin/docker compose down

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now resolvex
   ```

---

## 5. Updating the deployed app

```bash
cd resolvex
git pull
docker compose up --build -d
```

Docker Compose only rebuilds images whose source changed, so this is safe to run
regularly (e.g. from a CI/CD pipeline via SSH, or a simple deploy script).

## 6. Useful operational commands

```bash
docker compose logs -f backend        # tail backend logs
docker compose logs -f nginx          # tail proxy logs
docker compose exec backend sh        # shell into the backend container
docker compose exec mongo mongosh resolvex   # open a Mongo shell against the app DB
docker compose down && docker compose up -d  # full restart
```
