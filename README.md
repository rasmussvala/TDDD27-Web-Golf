# TDDD27: Web Multiplayer Game

## Description

Welcome to our project for TDDD27. We have created a web-based multiplayer golf game where players can compete against each other in real-time. The golf game is based on a previous project in the course TNM085, which deals with physics simulation through Euler approximation (link to GitHub repo: https://github.com/Grantallkotten/Modeling-and-animation). Beyond gameplay, players can interact via chat during sessions, access personal statistics, and vie for the top spot on the leaderboard.

### Try it yourself
Link: https://webgolf.vercel.app  

### Technologies and Frameworks

We use the following technologies and frameworks:

- **React.js**: For building the user interface.
- **Firebase**: For storing player data, game statistics, and other relevant information.
- **Three.js**: For creating the game.
- **Anime.js**: For simple UI related animations.

### Main Features

- User accounts
- User statistics
- Lobby codes to join games
- Game chat
- Real-time gameplay

### Run it on your local machine

To be able to run the code on your own machine, you need to take the following steps:

1. **Clone the Repository**: `git clone https://gitlab.liu.se/rassv453/tddd27-aweb.git`
2. **Install Dependencies**: `npm install`
3. **Set Up Environment Variables**: Create a **.env** file in the root of the project directory and add your Firebase API Key (It can be found at https://shorturl.at/l8ITJ). Then add the following line in your **.env** `REACT_APP_API_KEY=your_api_key_here`
4. **Run the Development Server**: `npm start`

![photo-collage png](https://github.com/rasmussvala/Web-Golf/assets/91534734/d67b9818-27fc-40f7-837b-c242129ed1d5)

