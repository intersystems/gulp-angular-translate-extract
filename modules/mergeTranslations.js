'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var stringify = require('json-stable-stringify');

/**
 * Interns
 */
var Translations = require('./translations');

function MergeTranslations(options) {
    /* jshint validthis: true */
    this.defaultLang = options.defaultLang || '.';
    this.json = {};
    this.nullEmpty = options.nullEmpty || false;
    this.safeMode = !!options.safeMode;
    this.destinationPath = options.dest || './i18nextract';
    this.translations = {};
    this.tree = options.namespace || false;
}

MergeTranslations.prototype.process = function(results, lang) {
    /**
     * Create translation object.
     */
    var _translation = new Translations({
            safeMode: this.safeMode,
            tree: this.tree,
            nullEmpty: this.nullEmpty
        }, results);

    try {
        var data = fs
            .readFileSync(path.join(this.destinationPath, lang + '.json'));
        this.json = stringify(data);
        this.translations = _translation
            .getMergedTranslations(Translations.flatten(this.json), this.isDefaultLang);
    }
    catch (error) {
        this.translations = _translation
            .getMergedTranslations({}, this.isDefaultLang);
    }

    this.logStatistics(_translation.getStats(), lang);
    return this.translations;
};

MergeTranslations.prototype.logStatistics = function (statistics, lang) {
    var log = [
        lang + ' statistics: ',
        ' Updated: ' + statistics.updated,
        ' / Deleted: ' + statistics.deleted,
        ' / New: ' + statistics.new
    ];

    gutil.log(chalk.blue(log.join('')));
};

module.exports = MergeTranslations;