class FootballModel {
  constructor(highlights = [], upVoted = [], popular = [], observers = [], currentComp = null, allMatches = null, users = []) {
    this.highlights = highlights;
    this.upVoted = upVoted;
    this.popular = popular;
    this.currentComp = currentComp;
    this.allMatches = allMatches;
    this.observers = observers;
    this.currentUser = null;
    this.users = users;
  }

  selectCompetition(comp) {
    this.currentComp = comp;
  }

  setMatches(matches) {
    this.allMatches = matches;
  }

  findMatches(teamName, type) {
    let caseSense = teamName.toLowerCase();
    let matches = this.allMatches.matches.filter(mtch => mtch.homeTeam.name.toLowerCase().includes(caseSense) || mtch.awayTeam.name.toLowerCase().includes(caseSense));
    if (type === "ALL") {
      return matches;
    } 
    else if(type === "LIVE")
    type = "IN_PLAY"; 
    
    matches = matches.filter(mtp => mtp.status === type);
    
    return matches;
  }

  addObserver(callback) {
    let result = this.observers;
    result = [...result, callback];
    this.observers = result;
    return this.observers;
  }

  removeObserver(callback) {
    let result = this.observers;
    result = result.filter(observer => observer !== callback);
    this.observers = result;
  }

  notifyObservers() {
    if (!(this.observers === undefined || this.observers.length === 0))
      this.observers.forEach(cb => {
        try {
          cb()
        }
        catch (e) {
          console.error(e)
        }
      });
  }

  addUpVote(props) {
    //Check that the user is not signed out when voting
    if (this.currentUser === null || this.currentUser === 0) {
      alert("You must sign in to upvote");
      return this.upvoted;
    }

    //Check that the user does not upvote each game more than once
    if (this.gameHasAlreadyBeenUpvotedByUser(props)) {
      //alert("You can only upvote each game once!");
      this.deleteUpvote(props);
      return this.upvotedGames;
    }

    this.upvoteInformationUpdateForCurrentUser(props);

    let item = this.upVoted.find(item => item.title === props.title);

    if (item === undefined) {
      props.upVotes = 1;
      this.upVoted = [...this.upVoted, props];
    }
    else {
      let index = this.upVoted.indexOf(item);
      this.upVoted[index].upVotes++;
      this.sortUpVote();
    }
    this.notifyObservers();
    return this.upVoted;
  }

  sortUpVote() {
    let length = this.upVoted.length;
    let currentNum;
    let current;

    for (let i = length - 1; i >= 0; i--) {
      currentNum = this.upVoted[i].upVotes;
      current = this.upVoted[i];
      let j = i;
      while ((j < length - 1) && (this.upVoted[j + 1].upVotes > currentNum)) {
        this.upVoted[j] = this.upVoted[j + 1];
        j++;
      }
      this.upVoted[j] = current;
    }
  }

  deleteUpvote(props) {
    let item = this.upVoted.find(item => item.title === props.title);

    if (item === undefined) {
    }

    else {
      let index = this.upVoted.indexOf(item);
      if (this.upVoted[index].upVotes > 0) {
        this.upVoted[index].upVotes--;
        if (this.upVoted[index].upVotes === 0) {
          this.upVoted.splice(index, 1);
        }
        this.filterUpVote();
        this.sortUpVote();
      }
      else {
      }
    }
    this.deleteUpvoteFromUsersArray(props);
  }



  deleteUpvoteFromUsersArray(props) {
    let itemToBeDeleted = this.users[this.currentUser - 1].upvotedGames.find(item => item.title === props.title);

    if (itemToBeDeleted === undefined) {
      return;

    }

    this.users[this.currentUser - 1].upvotedGames = Object.values(this.users[this.currentUser - 1].upvotedGames).filter(removeFilter);


    function removeFilter(item) {
      return item.title !== itemToBeDeleted.title;
    }

    if (this.users[this.currentUser - 1].upvoteCount > 0) {
      this.users[this.currentUser - 1].upvoteCount--;
    }

    if (this.users[this.currentUser - 1].upvotedGames.length === 0) {
      this.users[this.currentUser - 1].upvotedGames = [1];
    }
    this.notifyObservers(); 
  }


  //Remove videos from homepage that have no upvotes
  filterUpVote() {
    this.upVoted = Object.values(this.upVoted).filter(removeFilter);
    function removeFilter(item) {
      return item.upVotes > 0;
    }
  }




  //Register a new user
  addUser(email, password) {
    if (this.getUserIndex(email) > 0) {
      return "User " + email + " is already registered";
    }

    if (!this.emailIsValid(email)) {
      return "Invalid email address";
    }

    if (!this.passwordIsLongEnough(password)) {
      return "Password must be at least 8 characters"
    }

    let newUser = {};
    newUser.email = email;
    newUser.password = password;
    newUser.upvoteCount = 0;
    newUser.upvotedGames = [1]; //Save upvoted games for each user
    this.users.push(newUser);
    this.logInUser(email, password);
    return "";
  }


  //Sign in user
  logInUser(email, password) {

    let index = this.getUserIndex(email);
    if (index > 0) {
      if (this.passwordIsCorrect(email, password)) {
        this.currentUser = index;
        this.notifyObservers();
        return "";
      }
      else {
        return "Log in failed"; //if password is incorrect
      }
    }

    else {

      return "No such user"; //if user does not exist
    }
  }

  logOutUser() {
    this.currentUser = null;
    this.notifyObservers();
  }

  //Check if the username (email) has been registered
  //Return a unique index
  getUserIndex(email) {
    let index = null;
    let count = 0;

    this.users.forEach(element => {
      count++;

      if (email === element.email) {

        index = count;
      }
    })
    return index;
  }

  //Validate password
  passwordIsCorrect(email, password) {
    let b = false;

    this.users.forEach(element => {

      if (email === element.email) {
        if (password === element.password) {
          b = true;
        }
      }
    })
    return b;

  }

  //Validate that the username is an email address
  emailIsValid(email) {
    let regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (email.match(regexEmail)) {
      return true;
    } else {
      return false;
    }
  }

  //Validate that the requested password is at least 8 characters
  passwordIsLongEnough(password) {
    return password.length >= 8;
  }

  //Save information about a user's upvoted games
  //Count total number of upvotes for a user
  upvoteInformationUpdateForCurrentUser(props) {
    let newGame = {};
    newGame.title = props.title;
    if (props.date === null || typeof (props.date) === "undefined" || props.date === undefined) {
      newGame.date = "No data..................";
    }
    else {
      newGame.date = props.date;
    }

    newGame.url = props.matchviewUrl;
    if (this.users[this.currentUser - 1].upvoteCount === 0) {
      this.users[this.currentUser - 1].upvotedGames.unshift(newGame);
      this.users[this.currentUser - 1].upvotedGames.pop();
    }

    else {
      this.users[this.currentUser - 1].upvotedGames.unshift(newGame);
    }
   
    this.users[this.currentUser - 1].upvoteCount++;
    return true;
  }

  //Return true if the game has previously been upvoted by the user
  gameHasAlreadyBeenUpvotedByUser(props) {
    if (this.users[this.currentUser - 1].upvotedGames === undefined || this.users[this.currentUser - 1].upvotedGames === null) {
      this.users[this.currentUser - 1].upvotedGames = [];

    }

    let hasBeenUpvoted = false;
    this.users[this.currentUser - 1].upvotedGames.forEach(element => {
      if (element.title === props.title)
        hasBeenUpvoted = true;
    })
    return hasBeenUpvoted;
  }
}

export default FootballModel;

