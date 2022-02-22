var typescriptTransform = require('i18next-scanner-typescript');

module.exports = {
  options: {
    debug: true,
    sort: true,
    func: {
      // don't pass ts or tsx here!
      extensions: ['.js', '.jsx'],
      list: ["i18next.t", "i18n.t", "t"]
    },
    trans: {
      // don't pass ts or tsx here!
      extensions: ['.js', '.jsx'],
    },
    resource: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json',
      savePath: 'locales/{{lng}}/{{ns}}.json',
    },
    lngs: ['en', 'it'],
    // your i18next-scanner config
    defaultLng: 'en',
    defaultValue: '__STRING_NOT_TRANSLATED__'
  },
  transform: typescriptTransform({
    // default value for extensions
    extensions: [".tsx", ".ts"],
    // optional ts configuration
    tsOptions: {
      target: "es2018",
    },
  })
};
