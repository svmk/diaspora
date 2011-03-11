/*   Copyright (c) 2010, Diaspora Inc.  This file is
 *   licensed under the Affero General Public License version 3 or later.  See
 *   the COPYRIGHT file.
 */

(function() {
  var Mentions = function() {
    this.start = function() {
      this._superclass.input.autocomplete(this.contacts, this.options);
      this.oldInputContent = this._superclass.input.val();
      
    };

    this.loadContacts = function(contacts) {
      this.contacts = contacts;
    };
  };

  Mentions.prototype.options = {
    inChars : 1,
    max : 5,
    onSelect : Mentions.onSelect,
    searchTermFromValue: Mentions.searchTermFromValue,
    scroll : false,
    formatItem: function(row) {
      return "<img src='"+ row.avatar +"' class='avatar'/>" + row.name;
    },
    formatMatch: function(row) {
        return row.name;
    },
    formatResult: function(row) {
        return row.name;
    },
    disableRightAndLeft : true
  };

  Mentions.prototype.onSelect = function(visibleInput, data, formatted) {
    var visibleCursor
  };

  Mentions.prototype.mentionList =




  
  Diaspora.widgets.add("publisher.mentions", Mentions);
})();

    hiddenMentionFromPerson : function(personData){
      return "@{" + personData.name + "; " + personData.handle + "}";
    },

    onSelect :  function(visibleInput, data, formatted) {
      var visibleCursorIndex = visibleInput[0].selectionStart;
      var visibleLoc = Publisher.autocompletion.addMentionToInput(visibleInput, visibleCursorIndex, formatted);
      $.Autocompleter.Selection(visibleInput[0], visibleLoc[1], visibleLoc[1]);

      var mentionString = Publisher.autocompletion.hiddenMentionFromPerson(data);
      var mention = { visibleStart: visibleLoc[0],
                      visibleEnd  : visibleLoc[1],
                      mentionString : mentionString
                    };
      Publisher.autocompletion.mentionList.push(mention);
      Publisher.oldInputContent = visibleInput.val();
      Publisher.hiddenInput.val(Publisher.autocompletion.mentionList.generateHiddenInput(visibleInput.val()));
    },

    mentionList : {
      mentions : [],
      sortedMentions : function(){
        return this.mentions.sort(function(m1, m2){
          if(m1.visibleStart > m2.visibleStart){
            return -1;
          } else if(m1.visibleStart < m2.visibleStart){
            return 1;
          } else {
            return 0;
          }
        });
      },
      push : function(mention){
        this.mentions.push(mention);
      },
      generateHiddenInput : function(visibleString){
        var resultString = visibleString;
        for(i in this.sortedMentions()){
          var mention = this.mentions[i],
            start = resultString.slice(0, mention.visibleStart),
            insertion = mention.mentionString,
            end = resultString.slice(mention.visibleEnd);

          resultString = start + insertion + end;
        }
        return resultString;
      },

      insertionAt : function(insertionStartIndex, selectionEnd, keyCode){
        if(insertionStartIndex != selectionEnd){
          this.selectionDeleted(insertionStartIndex, selectionEnd);
        }
        this.updateMentionLocations(insertionStartIndex, 1);
        this.destroyMentionAt(insertionStartIndex);
      },
      deletionAt : function(selectionStart, selectionEnd, keyCode){
        if(selectionStart != selectionEnd){
          this.selectionDeleted(selectionStart, selectionEnd);
          return;
        }

        var effectiveCursorIndex;
        if(keyCode == KEYCODES.DEL){
          effectiveCursorIndex = selectionStart;
        }else{
          effectiveCursorIndex = selectionStart - 1;
        }
        this.updateMentionLocations(effectiveCursorIndex, -1);
        this.destroyMentionAt(effectiveCursorIndex);
      },
      selectionDeleted : function(selectionStart, selectionEnd){
        Publisher.autocompletion.mentionList.destroyMentionsWithin(selectionStart, selectionEnd);
        Publisher.autocompletion.mentionList.updateMentionLocations(selectionStart, selectionStart - selectionEnd);
      },
      destroyMentionsWithin : function(start, end){
        for (var i = this.mentions.length - 1; i >= 0; i--){
          var mention = this.mentions[i];
          if(start < mention.visibleEnd && end >= mention.visibleStart){
            this.mentions.splice(i, 1);
          }
        }
      },
      clear: function(){
        this.mentions = [];
      },
      destroyMentionAt : function(effectiveCursorIndex){

        var mentionIndex = this.mentionAt(effectiveCursorIndex);
        var mention = this.mentions[mentionIndex];
        if(mention){
          this.mentions.splice(mentionIndex, 1);
        }
      },
      updateMentionLocations : function(effectiveCursorIndex, offset){
        var changedMentions = this.mentionsAfter(effectiveCursorIndex);
        for(i in changedMentions){
          var mention = changedMentions[i];
          mention.visibleStart += offset;
          mention.visibleEnd += offset;
        }
      },
      mentionAt : function(visibleCursorIndex){
        for(i in this.mentions){
          var mention = this.mentions[i];
          if(visibleCursorIndex > mention.visibleStart && visibleCursorIndex < mention.visibleEnd){
            return i;
          }
        }
        return false;
      },
      mentionsAfter : function(visibleCursorIndex){
        var resultMentions = [];
        for(i in this.mentions){
          var mention = this.mentions[i];
          if(visibleCursorIndex <= mention.visibleStart){
            resultMentions.push(mention);
          }
        }
        return resultMentions;
      },
    },
    repopulateHiddenInput: function(){
      var newHiddenVal = Publisher.autocompletion.mentionList.generateHiddenInput(Publisher.input.val());
      if(newHiddenVal != Publisher.hiddenInput.val()){
        Publisher.hiddenInput.val(newHiddenVal);
      }
    },

    keyUpHandler : function(event){
      Publisher.autocompletion.repopulateHiddenInput();
      Publisher.determineSubmitAvailability();
    },

    keyDownHandler : function(event){
      var input = Publisher.input,
        selectionStart = input[0].selectionStart,
        selectionEnd = input[0].selectionEnd,
        isDeletion = (event.keyCode == KEYCODES.DEL && selectionStart < input.val().length) || (event.keyCode == KEYCODES.BACKSPACE && (selectionStart > 0 || selectionStart != selectionEnd)),
        isInsertion = (KEYCODES.isInsertion(event.keyCode) && event.keyCode != KEYCODES.RETURN);

      if(isDeletion){
        Publisher.autocompletion.mentionList.deletionAt(selectionStart, selectionEnd, event.keyCode);
      }else if(isInsertion){
        Publisher.autocompletion.mentionList.insertionAt(selectionStart, selectionEnd, event.keyCode);
      }
    },

    addMentionToInput: function(input, cursorIndex, formatted){
      var inputContent = input.val(),
        stringLoc = Publisher.autocompletion.findStringToReplace(inputContent, cursorIndex),
        stringStart = inputContent.slice(0, stringLoc[0]),
        stringEnd = inputContent.slice(stringLoc[1]);

      input.val(stringStart + formatted + stringEnd);
      var offset = formatted.length - (stringLoc[1] - stringLoc[0])
      Publisher.autocompletion.mentionList.updateMentionLocations(stringStart.length, offset);
      return [stringStart.length, stringStart.length + formatted.length]
    },

    findStringToReplace: function(value, cursorIndex){
      var atLocation = value.lastIndexOf('@', cursorIndex);
      if(atLocation == -1){return [0,0];}
      var nextAt = cursorIndex

      if(nextAt == -1){nextAt = value.length;}
      return [atLocation, nextAt];

    },

    searchTermFromValue: function(value, cursorIndex)
    {
      var stringLoc = Publisher.autocompletion.findStringToReplace(value, cursorIndex);
      if(stringLoc[0] <= 2){
        stringLoc[0] = 0;
      }else{
        stringLoc[0] -= 2
      }

      var relevantString = value.slice(stringLoc[0], stringLoc[1]).replace(/\s+$/,"");

      var matches = relevantString.match(/(^|\s)@(.+)/);
      if(matches){
        return matches[2];
      }else{
        return '';
      }
    },
  },



})();