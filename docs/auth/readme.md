## Quick Start

Before you start, please make sure that you have referenced GitHub App registered. Please visit [this link](https://developer.github.com/guides/basics-of-authentication/#registering-your-app) to get more information.

If you already have registered app replace existed github api key and secret into your local options file, as mentioned [here](/docs/getting-started/#5!).

Values, given below, are created as a demo. They are usable for [local instance](http://127.0.0.1:8080) at `127.0.0.1:8080`

```js
github: {
    appId: "cf00a9e7ee5d9d6af36f",
    appSecret: "aebe08e0aa66f6911e4f54df81ce64c9d6e0003b"
}
```

Please take into account, that auth feature is turned off by default and you have to set related option: `options.modulesEnabled.auth` to `true` in your config.

After that, auth feature is able to use.

### Client-side auth control

GitHub login module should be embedded into your `header.inc.html` or any other place you want.

Here is the example:

```html
<!-- header.inc.html content-->
      <a class="js-hook source_login"></a>
<!-- header.inc.html content-->
```

Auth uses `js-hook` and `source_login` classes for targeting. This hook is defined into `/assets/js/enter-the-source.js` file.

## Auth configuration

Auth configuration is available from your instance [options](/docs/getting-started/#configuration), as it was mentioned above. Here's few of available options:

```js
// localStorage key for client-side user object
'storageKey': 'sourcejsUser',

// avatar stub URL
'defaultAvatarURL': '/source/assets/i/unknown.gif',

// set of client-side control classes
'classes': {
    'controlsWrapper': 'source_login',
    'loginButton': 'source_login-button',
    'avatar': 'source_login-avatar',
    'anonymous': 'anonymous',
    'hook': 'js-hook'
},

// login/logout button labels
'labels': {
    'login': 'Login',
    'logout': 'Logout'
}
```

View the full list in `/assets/js/modules/auth.js` file.

## Auth modules usage

Both server-side and client-side auth parts are able to use from other modules.

Server-side part provides [The everyauth](https://github.com/bnoguchi/everyauth) API whitch it is based on. Also there are methods either to get or to set GitHub user into temporary users storage.

Client-side part allows to login/logout using Github, to check if user is logined and to get user data.
