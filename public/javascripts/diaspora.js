/*   Copyright (c) 2010, Diaspora Inc.  This file is
*   licensed under the Affero General Public License version 3 or later.  See
*   the COPYRIGHT file.
*/

var Diaspora = Diaspora || {};

Diaspora.WidgetCollection = function() {
  this.ready = false;
  this.collection = {};
};

Diaspora.WidgetCollection.prototype.add = function(widgetId, widget) {
  var _namespaces = widgetId.split(".");

  if(_namespaces.length) {
    _namespaces.pop();
    widget.prototype._superclass = this.collection[_namespaces.join(".")];
  }

  this[widgetId] = this.collection[widgetId] = new widget();
  if(this.ready) {
    this.collection[widgetId].start();
  }
};

Diaspora.WidgetCollection.prototype.remove = function(widgetId) {
    delete this.collection[widgetId];
};

Diaspora.WidgetCollection.prototype.init = function() {
  this.ready = true;
  for(var widgetId in this.collection) {
    this.collection[widgetId].start();
  }
};

Diaspora.widgets = Diaspora.widgets || new Diaspora.WidgetCollection();

$(document).ready(function() {
  Diaspora.widgets.init();
});

