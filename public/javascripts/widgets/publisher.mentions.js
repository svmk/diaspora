/*   Copyright (c) 2010, Diaspora Inc.  This file is
 *   licensed under the Affero General Public License version 3 or later.  See
 *   the COPYRIGHT file.
 */

(function() {
  var Mentions = function() {
    this.mentions = [];
    this.contacts = [{value: "foo@joindiaspora.com", name: "foo"}, {value: "bar"}, {value: "sup"}];

    this.start = function() {
      this._superclass.input.autoSuggest(this.contacts, {
        selectedItemProp: "name",
        selectionAdded: function(mention) {
          Diaspora.widgets["publisher.mentions"].selectionAdded(mention.text().substring(1));
        },
        selectionRemoved: function(mention) {
          Diaspora.widgets["publisher.mentions"].selectionRemoved(mention.text().substring(1));
        }
      });
    };
  };

  Mentions.prototype.selectionAdded = function(mention) {
    this.mentions.push(mention);
    $('<input type="hidden" name="mentions[]"/>').val(mention).appendTo(this._superclass.form);
  };

  Mentions.prototype.selectionRemoved = function(mention) {
    delete this.mentions[this.mentions.indexOf(mention)];
    $('input[name="mentions[]"][value="' + mention + '"]').detach();
  };


  Diaspora.widgets.add("publisher.mentions", Mentions);
})();