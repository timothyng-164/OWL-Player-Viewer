var owlData = new Vue({
  el: 'main',
  data: {
    playerData: [],
    teamData: {},
    allTeams: true,
    showRoles: {
      offense: true,
      tank: true,
      support: true,
    },
    sortAscending: {
      name: 0,
      number: 0,
      teamId: 0,
      twitchName: 0,
      role: 0
    }
  },
  methods: {
    sortToggle: function(sortValue) {
      if (this.sortAscending[sortValue] % 2 != 0) {
        this.playerData.sort((a, b) => (a[sortValue] < b[sortValue]) ? 1 : -1);   // decsending
      } else {
        this.playerData.sort((a, b) => (a[sortValue] > b[sortValue]) ? 1 : -1);   // ascending
      }
      for (key in this.sortAscending) {
        (key != sortValue) ? this.sortAscending[key] = 0 : this.sortAscending[sortValue]++;
      }
    },
    updateTeam: function(teamId) {
      this.teamData[teamId].show = !this.teamData[teamId].show;
      teamIsOn() ? allTeams.classList.remove('hidden') : allTeams.classList.add('hidden');
    },
    updateRole: function(roleName) {
      this.showRoles[roleName] = !this.showRoles[roleName];
      roleIsOn() ? allRoles.classList.remove('hidden') : allRoles.classList.add('hidden');
    },
    filterPlayers: function() {
      for (player of this.playerData) {
        if (this.showRoles[player.role] == true && this.teamData[player.teamId].show == true) {
          player.show = true;
        } else {
          player.show = false;
        }
      }
      for (sortKey in this.sortAscending) { this.sortAscending[sortKey] = false; }
    },
    hexToRgb: function(hex, alpha) {
       hex   = hex.replace('#', '');
       var r = parseInt(hex.length == 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
       var g = parseInt(hex.length == 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
       var b = parseInt(hex.length == 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
       if ( alpha ) {
          return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
       }
       else {
          return 'rgb(' + r + ', ' + g + ', ' + b + ')';
       }
    }
  }
})


/*** save overwatch player and team data into owlData ***/
fetch('https://api.overwatchleague.com/v2/teams/').then(function(response) {
    return response.json()
  })
  .then(function(response) {
    for (team of response.data) {
      owlData.teamData[team.id] = {
        name: team.name,
        teamLogo: team.logo.main.svg,
        teamColors: team.colors,
        show: true
      };
      for (player of team.players) {
        twitchAcc = "";
        for (account of player.accounts) {
          if (account.type == "TWITCH") {
            twitchAcc = account.url.split("/").pop();
          }
        }
        owlData.playerData.push({
          name: player.name,
          role: player.role,
          number: player.number,
          headshot: player.headshot,
          socials: player.accounts,
          twitchName: twitchAcc,
          show: true,
          live: false,
          numViewers: 0,
          teamId: team.id
        });
      }
    }
    owlData.sortToggle('name');
  })


/************ toggle all teams **************/
var allTeams = document.getElementsByClassName('all-teams')[0];
allTeams.addEventListener("click", function () {
  // hide all teams if any team is shown
  var toggleOff = teamIsOn();
  for (tId in owlData.teamData) { owlData.teamData[tId].show = !toggleOff; }
  owlData.filterPlayers();
  // set button effect
  var teamButtons = document.getElementsByClassName('team-button');
  if (toggleOff) {
    for (button of teamButtons) { button.classList.add('hidden'); }
  } else {
    for (button of teamButtons) { button.classList.remove('hidden'); }
  }
});

function teamIsOn() {
  for (tId in owlData.teamData) {
    if (owlData.teamData[tId].show) { return true; }
  }
  return false;
}

/************ toggle all roles **************/
var allRoles = document.getElementsByClassName('all-roles')[0];
var roleButtons = document.getElementsByClassName('role-button');

allRoles.addEventListener("click", function () {
  // hide all roles if any role is shown
  var toggleOff = roleIsOn();
  for (role in owlData.showRoles) { owlData.showRoles[role] = !toggleOff; }
  owlData.filterPlayers();
  // set button effect
  if (toggleOff) {
    for (button of roleButtons) { button.classList.add('hidden'); }
  } else {
    for (button of roleButtons) { button.classList.remove('hidden'); }
  }
});

function roleIsOn() {
  for (role in owlData.showRoles) {
    if (owlData.showRoles[role]) { return true; }
  }
  return false;
}
