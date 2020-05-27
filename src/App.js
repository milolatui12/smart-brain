import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Logo from './components/Logo/Logo'
import Signin from './components/Signin/Signin'
import Signup from './components/Signup/Signup'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm' 
import Rank from './components/Rank/Rank' 
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';


const app = new Clarifai.App({
  apiKey: '149c56981c6f4931805fe8cccf6670e2'
 });

const particlesOption = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 80
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl:'', 
      box: {}, 
      route: 'signin',
      user: {
          id: '',
          name: '',
          email: '',
          entries: 0,
          joined: ''
      }
    };
  }

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }
  
  caculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('image');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      topRow: clarifaiFace.top_row * height,
      bottomRow: height - (clarifaiFace.bottom_row * height),
      leftCol: clarifaiFace.left_col * width,
      rightCol: width - (clarifaiFace.right_col * width)
    }
  }

  displayBox = (box) => {
    this.setState({box : box})
  }

  onInputChange = (event) => {
     this.setState({input: event.target.value});
  }
  
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    .then(resp => {
      if(resp) {
        fetch('https://quiet-cove-54907.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
      }
      this.displayBox(this.caculateFaceLocation(resp))
      })
    .catch(err => console.log(err))
  }

  onRouteChange = (route) => {
    this.setState({route: route})
    this.setState({imageUrl: ''})
  }

  render() {
    return (
      <div className="App">
        <Particles className='particles' params={ particlesOption } />
        {
        this.state.route === 'home' ?
        <div>
          <Navigation onRouteChange={this.onRouteChange} />
          <Logo /> 
          <Rank name={this.state.user.name} entries={this.state.user.entries} />
          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
        </div>
        : (
          this.state.route === 'signin' ?
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> :
          <Signup loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
        )
        }
      </div>
    );
  }
}

export default App;
