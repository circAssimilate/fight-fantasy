import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { compose } from 'recompose'

import { withFirebase } from '../Firebase'

import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes'

const formChildrenStyles = {
  display: 'block',
  marginTop: 5,
  marginBottom: 5,
}

const SignUpPage = () => (
  <div>
    <h1>SignUp</h1>
    <SignUpForm />
  </div>
)

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  isAdmin: false,
  error: null,
}

class SignUpFormBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    const { username, email, passwordOne, isAdmin } = this.state
    const roles = [];

    roles.push(ROLES.VIEWER);

    if (isAdmin) {
      roles.push(ROLES.ADMIN);
    }

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in your Firebase realtime database
        return this.props.firebase
          .user(authUser.user.uid)
          .set({
            created: new Date(),
            email,
            username,
            roles,
          });
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE })
        this.props.history.push(ROUTES.HOME)
      })
      .catch(error => {
        this.setState({ error })
      });

    event.preventDefault()
  }

  onChangeInput = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  onChangeCheckbox = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      isAdmin,
      error,
    } = this.state

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          style={formChildrenStyles}
          name="username"
          value={username}
          onChange={this.onChangeInput}
          type="text"
          placeholder="Username"
        />
        <input
          style={formChildrenStyles}
          name="email"
          value={email}
          onChange={this.onChangeInput}
          type="text"
          placeholder="Email Address"
        />
        <input
          style={formChildrenStyles}
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChangeInput}
          type="password"
          placeholder="Password"
        />
        <input
          style={formChildrenStyles}
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChangeInput}
          type="password"
          placeholder="Confirm Password"
        />
        <label style={formChildrenStyles}>
          Admin:
          <input
            name="isAdmin"
            type="checkbox"
            checked={isAdmin}
            onChange={this.onChangeCheckbox}
          />
        </label>
        <button
          style={formChildrenStyles}
          disabled={isInvalid}
          type="submit">
          Sign Up
        </button>

        {error && <p>{error.message}</p>}
      </form>
    )
  }
}

const SignUpLink = () => (
  <p>
    Don&apos;t have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
)

const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignUpFormBase);

export default SignUpPage

export const SignUpFormWithFirebase = withFirebase(SignUpFormBase)

export { SignUpForm, SignUpLink }
