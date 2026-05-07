import { all, fork } from 'redux-saga/effects';
import authSaga from '../features/auth/authSaga';
import userSaga from '../features/users/userSaga';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(userSaga)]);
}
