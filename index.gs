function mytrigger(evt) {
  if(hasValue(evt.oldValue,evt.value)){
    MailApp.sendEmail(Session.getActiveUser().getEmail(),"Spredsheet edited on " + evt.range.getA1Notation(), "New value:" + evt.value)    
  }
}

function hasValue(old_value,new_value){
  if(new_value){
    var new_trimmed = new_value.trim()
    if((old_value != new_value) && (new_trimmed != old_value) && (new_value != "" || new_value!= " ")){
      return true
    }
  }
  return false
}
function mailTrigger(){
  var threads = GmailApp.search("from: me to:"+ SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail() + " subject: Re: Spredsheet")
  for(var i=0;i<threads.length;i++){
    var messages_in_thread = threads[i].getMessages()
    if(messages_in_thread){
      var last_message = messages_in_thread[messages_in_thread.length - 1]
      
      if(last_message.isUnread()){
        var regex = new RegExp(">(\\w+)<", "g");
        var body = last_message.getBody()
        var cell_a1_notation = last_message.getSubject().split(" ").pop()
        
        var answer = regex.exec(body)[1]
        SpreadsheetApp.getActiveSheet().getRange(cell_a1_notation).setValue(answer);
        last_message.markRead();
      }
    }
  }
}