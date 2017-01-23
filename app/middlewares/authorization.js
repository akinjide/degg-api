import _ from 'lodash';
import * as Handler from '../utils/handlers';
import {
  default as HTTPStatus,
  code as HTTPCode
} from '../utils/http-status';


const hasAuthorization = (role) => {
  return function *(next) {
    if (!_.isEmpty(_.intersection([this.state.user.role], role))) {
      yield next;
    }
    else {
      this.status = HTTPStatus.FORBIDDEN;
      this.body = yield* Handler.error(this.route.path, 'Forbidden', `User is not authorized to perform the role of a(an) ${role}`, this.status);
    }
  }
}

export {hasAuthorization};
