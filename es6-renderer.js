const utils = require('./utils');
/* jshint ignore:start */
const compile = (content, $ = '$') => Function($, 'return `' + content + '`;');
/* jshint ignore:end */
const setPath = (views, ref, ext) => ref.endsWith(ext) ? ref : views  + '/' + ref + ext;
const getPartial = (path, settings, cb = 'resolveNeutral') => {
  const findFile = function(resolve, reject) {
    this.resolveNeutral = (err, content) => err ? reject(new Error(err)) : resolve(content);
    this.resolvePositive = (err, content) => resolve(err || content);
    utils.readTemplate(path, settings, this[cb])
  };
  return new Promise(findFile);
};
    
module.exports = (path, options, render = (err, content) => err || content) => {
  if(options === undefined || options instanceof Array) {
    return compile(path, options);
  }
  const {locals = {}, partials = {}, settings, template} = options;
  const escape = (val) => settings && settings.escape === false ? val : utils.escape(val);
  
  const assign = (err, content) => {
    if(err) {
      return render(new Error(err));
    }
    const localsKeys = Object.keys(locals);
    const localsValues = localsKeys.map(i => escape(locals[i]));
    const partialsKeys = Object.keys(partials);
    const compilePartials = values => {
      const valTempList = localsValues.concat(escape(values));
      localsValues.push(...values.map(i => compile(i, localsKeys)(...valTempList)));
      return render(null, compile(content, localsKeys)(...localsValues));
    };
    if(partialsKeys.length) {
      const applySettings = () => {
        const ext = '.' + settings['view engine'];
        if(typeof settings.views === 'string') {
          return i => getPartial(setPath(settings.views, partials[i], ext), settings);
        }
        return i => {
          const getFile = view => getPartial(setPath(view, partials[i], ext), settings, 'resolvePositive');
          const getFirst = value => typeof value === 'string';
          const searchFile = (resolve, reject) => {
            const getContent = values => resolve(values.find(getFirst));
            Promise.all(settings.views.map(getFile)).then(getContent);
          };
          return new Promise(searchFile);
        };
      };
      const setPartial = settings ? applySettings() : i => getPartial(partials[i], settings);
      localsKeys.push(...partialsKeys);
      return Promise.all(partialsKeys.map(setPartial))
        .then(compilePartials)
        .catch(err => render(err));
    }
    return render(null, compile(content, localsKeys)(...localsValues));
  };
  if (template) {
    return assign(null, path);
  }
  utils.readTemplate(path, settings, assign);
};
