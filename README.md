# TDDD27: Web Multiplayer Game

## Description

Welcome to our project for TDDD27. Our goal is to develop a web-based multiplayer golf game where players can compete against each other in real-time.
The golf game is based on a previous project in the course TNM085, which deals with physics simulation through Euler approximation (link to GitHub repo: https://github.com/Grantallkotten/Modeling-and-animation). In addition to the gameplay, we aim to enable players to chat with each other during game sessions. Furthermore, players will have access to their personal statistics to track their progress.

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

### Screencast

- Here's the link to our group presentation: https://youtu.be/G7BI_etnPe8
- Here's the link to Wilhelm's individual presentation: https://youtu.be/A0MuNPCe_TQ
- Here's the link to Rasmus' individual presentation: https://youtu.be/1QR93bWLi_E

### Run it on your local machine

To be able to run the code on your own machine, you need to take the following steps:

1. **Clone the Repository**: `git clone https://gitlab.liu.se/rassv453/tddd27-aweb.git`
2. **Install Dependencies**: `npm install`
3. **Set Up Environment Variables**: Create a **.env** file in the root of the project directory and add your Firebase API Key (It can be found at https://shorturl.at/l8ITJ). Then add the following line in your **.env** `REACT_APP_API_KEY=your_api_key_here`
4. **Run the Development Server**: `npm start`
