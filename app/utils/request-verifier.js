import _ from 'lodash';

class RequestVerifier {
  constructor() {
    this.errors = {}
  }

  checkRequestBody(params, requiredFields) {
    for (let i = 0; i < requiredFields.length; i++) {
      if (!params[requiredFields[i]]) this.errors[`.${requiredFields[i]}`] = 'is required'
    }

    return this.errors;
  }
}

export default RequestVerifier;