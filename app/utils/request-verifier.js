import 'babel-polyfill';
import _ from 'lodash';
import Joi from 'joi';

class RequestVerifier {
  constructor() {
    this.errors;
    this.fields;
  }

  /**
   * Check Request Body for property required.
   *
   * @param {Object} params
   * @param {Array} requiredFields
   * @return {Object} Errors
   * @public
   */
  checkRequestBody(params, requiredFields) {
    this.errors = {};

    _.each(requiredFields, (value, key) => {
      if (!params[requiredFields[key]]) {
        this.errors[`.${requiredFields[key]}`] = 'is required';
      }
    });

    return this.errors;
  }

  /**
   * Check Request Query for property required.
   *
   * @param {String} params
   * @param {Array} allowedQueryParams
   * @param {Object} exclude
   * @return {Object} fields
   * @public
   */
  checkRequestQuery(params, allowedQueryParams, exclude={}) {
    this.fields = {};
    params = _.replace(params, 'id', '_id');

    const sep = ',';
    const projection = _.intersection(_.split(_.toLower(params), sep), allowedQueryParams);

    if (!_.isEmpty(projection)) {
      if (_.eq(_.indexOf(projection, '_id'), -1)) {
        projection.push('_id');
      }

      _.each(projection, (value, key) => {
        if (_.eq(value, '_id') && !_.includes(params, '_id')) {
          this.fields[value] = 0;
        } else {
          this.fields[value] = 1;
        }
      });
    } else {
      return { fields: _.merge(this.fields, exclude) };
    }

    return { fields: _.merge(this.fields, exclude) };
  }
}

/**
 * Expose `RequestVerifier`
 *
 * @type {Object} RequestVerifier Class
 * @api public
 */
export default RequestVerifier;
