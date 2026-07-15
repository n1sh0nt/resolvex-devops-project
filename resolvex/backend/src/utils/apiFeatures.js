// Chainable query helper: filter -> search -> sort -> paginate
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query
    this.queryString = queryString; // req.query
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Support gte/gt/lte/lt operators e.g. ?createdAt[gte]=2024-01-01
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsed = JSON.parse(queryStr);

    // Remove empty-string filters (from unselected dropdowns)
    Object.keys(parsed).forEach((key) => {
      if (parsed[key] === '') delete parsed[key];
    });

    this.query = this.query.find(parsed);
    return this;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const searchRegex = new RegExp(
        this.queryString.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );
      const orConditions = fields.map((field) => ({ [field]: searchRegex }));
      this.query = this.query.find({ $or: orConditions });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = ApiFeatures;
