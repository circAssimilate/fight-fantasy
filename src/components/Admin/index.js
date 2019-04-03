import React, { Component } from 'react'
import { compose } from 'recompose'

import { withAuthorization } from '../Session'
import { withFirebase } from '../Firebase'
import { SignUpFormWithFirebase } from '../SignUp'

import * as ROLES from '../../constants/roles'

class AdminPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      users: [],
    }
  }

  componentDidMount() {
    this.setState({ loading: true })

    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val()

      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key,
      }))

      this.setState({
        users: usersList,
        loading: false,
      })
    })
  }

  componentWillUnmount() {
    this.props.firebase.users().off()
  }

  handleToggle = (user) => {
    const isAdmin = user.roles.includes(ROLES.ADMIN) 

    this.props.firebase.user(user.uid)
      .update({
        roles: [
          ...(
            isAdmin ?
            user.roles.filter(role => role !== ROLES.ADMIN) :
            user.roles.concat([ROLES.ADMIN])
          )
        ],
      })
  }

  render() {
    const { users, loading } = this.state

    return (
      <div>
        <h1>Admin</h1>
        <p>
          The Admin Page is accessible by every signed in admin user.
        </p>

        {loading && <div>Loading ...</div>}

        <h2>Create User</h2>
        <SignUpFormWithFirebase />

        <h2>Users</h2>
        <UserList users={users} handleToggle={this.handleToggle}/>
      </div>
    )
  }
}

const UserList = ({ handleToggle, users }) => (
  <ul>
    {users.map(user => (
      <li key={user.uid}>
        <strong>Username:</strong> {user.username}
        <ul>
          <li>
            <strong>ID:</strong> {user.uid}
          </li>
          <li>
            <strong>E-Mail:</strong> {user.email}
          </li>
          <li>
            <strong>Admin:</strong> {String(user.roles.includes(ROLES.ADMIN))}
            <button onClick={() => handleToggle(user)}>toggle admin</button>
          </li>
        </ul>
      </li>
    ))}
  </ul>
)

const condition = authUser =>
  authUser && authUser.roles.includes(ROLES.ADMIN)

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage)
