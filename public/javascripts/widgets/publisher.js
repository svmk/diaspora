/*   Copyright (c) 2010, Diaspora Inc.  This file is
 *   licensed under the Affero General Public License version 3 or later.  See
 *   the COPYRIGHT file.
 */
(function() {
  var Publisher = function() {
    this.start = function() {
      this.form = $("#publisher");
      this.input = $("#status_message_fake_message");
      this.hiddenInput = $("#status_message_message");
      this.submit = $("#status_message_submit");
      this.photoDropZone = $("#photodropzone");
      this.publicField = $("#status_message_public");

      this.bindServiceIcons();
      this.bindPublicIcon();

      if (this.input.val() == "") {
        this.close();
      }

      /*
      Publisher.input.keydown(this.autocompletion.keyDownHandler);
      Publisher.input.keyup(this.autocompletion.keyUpHandler);*/

      this.hiddenInput.val(this.input.val());
      this.input.focus(function() {
        Diaspora.widgets.publisher.open();
      });
    }
  };


  Publisher.prototype.close = function() {
    this.form.addClass("closed");
    this.input.css("min-height", "");
  };

  Publisher.prototype.open = function() {
    this.form.removeClass("closed");
    this.input.css("min-height", "42px");
    this.canSubmit();
  };

  Publisher.prototype.clear = function() {
    this.photoDropZone.children("li").remove();
    this.form.removeClass("with_attachments").css("padding-bottom", "");
  };

  Publisher.prototype.canSubmit = function() {
    var blank = (this.input.val.trim() === ""),
      isSubmitDisabled = this.submit.attr("disabled");
    if(blank && !isSubmitDisabled) {
      this.submit.attr("disabled", true);
    }
    else if(!blank && isSubmitDisabled) {
      this.submit.removeAttr("disabled");
    }
  };

  Publisher.prototype.bindServiceIcons = function() {
    $(".service_icon").click(function(evt) {
      evt.preventDefault();
      $(this).toggleClass("dim");
      Diaspora.widgets.publisher.toggleServiceField(this.id);
    });
  };

  Publisher.prototype.bindPublicIcon = function() {
    $(".public_icon").click(function(evt) {
      $(this).toggleClass("dim");

      if(this.publicField.val() === "false") {
        this.publicField.val("true");
      }
      else {
        this.publicField.val("false");
      }
    });

  };

  Publisher.prototype.toggleServiceField = function(service) {
    var serviceInput = this.form.find("[name='services[]'][value='" + service + "']");

    if(serviceInput.length) {
      serviceInput.remove();
    }
    else {
      this.form.append(
        '<input id="services" name="services[]" type="hidden" value="' + service + '"/>'
      );
    }
  };



  Diaspora.widgets.add("publisher", Publisher);
})();