const axios = require('axios');
const githubClient = axios.create({
  baseURL: 'https://api.github.com/',
  timeout: 1000,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    //'Authorization': 'token <your-token-here> -- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token'
  }
});

async function getMostFollowedUsers() {
  const noOfFollowers = 35000;
  const perPage = 10;
  //ref: https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-users
  const response = await githubClient.get(`search/users?q=followers:>${noOfFollowers}&per_page=${perPage}`, {timeout: 1500});
  return response.data.items;
}

async function getCounts(username) {
  const response = await githubClient.get(`users/${username}`);
  return {
    username,
    name: response.data.name,
    publicReposCount: response.data.public_repos,
    followersCount: response.data.followers
  };  
}

(async () => {
  try {
    const mostFollowedUsers = await getMostFollowedUsers();
    const popularUsernames = mostFollowedUsers.map(user => user.login);
    const popularUsersWithPublicRepoCount = await Promise.all(popularUsernames.map(getCounts));
    console.table(popularUsersWithPublicRepoCount);

    console.log(`======== Another view ========`);
    popularUsersWithPublicRepoCount.forEach((userWithPublicRepos) => {
      console.log(`${userWithPublicRepos.name} with username ${userWithPublicRepos.username} has ${userWithPublicRepos.publicReposCount} public repos and ${userWithPublicRepos.followersCount} followers on GitHub`);
    });
  } catch(error) {
    console.log(`Error calling Github API: ${error.message}`, error);
  }
})();
