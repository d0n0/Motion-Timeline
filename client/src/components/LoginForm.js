import React from 'react';
import { Container, Form, FormGroup, FormFeedback, Input, Card, CardBlock, CardTitle, Button } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Cookies from 'js-cookie';


class LoginForm extends React.Component {
  constructor() {
    super();
    this.state = { username: '', password: '', authResult: '' };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    const username = this.state.username;
    const password = this.state.password;

    fetch('/api/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('fetch error');
      }
    })
    .then(jsonRes => {
      if (jsonRes.status === 'ok') {
        Cookies.set('token', jsonRes.token._id, { path: '/', expires: 3 });
        this.props.callBack(true);
      } else if (jsonRes.status === 'ng') {
        this.setState({ authResult: jsonRes.status });
        this.props.callBack(jsonRes.status);
      }
    })
    .catch(err => {
      console.log(err);
    });
  }

  render() {
    return (
      <Container fluid>
        <Card block className="login-card">
          <CardBlock>
            <CardTitle className="login-card-title">
              <FontAwesome name="user-circle-o" size="3x" />
            </CardTitle>
          </CardBlock>
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Input type="text" value={this.state.username} onChange={this.handleChange} name="username" id="username" placeholder="Username" />
            </FormGroup>
            <FormGroup>
              <Input type="password" value={this.state.password} onChange={this.handleChange} name="password" id="password" placeholder="Password" />
            </FormGroup>

            {(this.state.authResult === "ng") ? (
              <FormGroup color="danger">
                <FormFeedback color="danger">Wrong password. Try again.</FormFeedback>
              </FormGroup>
            ) : null}

            <FormGroup>
              <Button type="submit" className="login-button" color="info" block>Login</Button>
            </FormGroup>
          </Form>
        </Card>
      </Container>
    );
  }
}

export default LoginForm;