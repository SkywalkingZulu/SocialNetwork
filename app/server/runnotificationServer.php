<?php

require_once 'app/lib/AutoLoader.php';


class notificationServer extends WebSocketServer {
  //protected $maxBufferSize = 1048576; //1MB... overkill for an echo server, but potentially plausible for other applications.
  
  protected function process ($user, $message) {
      
      $data=  json_decode($message);
      
      if($data->action == "getNotifications" && $data->auth_cookie!="")
      {
          $notifications = new Notification;
          $res=$notifications->getNotificationsByCookie($data->auth_cookie);
          $user->uid=$res[0]->to_user_id;
          
          $this->send($user, json_encode($res));
      }
      if($data->action == "openroom" && $data->auth_cookie!="")
      {
          $userObj = new User;
          $res = $userObj->find(array("auth_cookie" => $data->auth_cookie));
          
          $this->activeUser[$user->id]=$res[0]->name;
          $this->channel["default"][]="Welcome " . $this->activeUser[$user->id];
          $this->send($user, json_encode(array("activeUsers" => $this->activeUser ,"channel"=>$this->channel)));      
      }
      if($data->action == "openroom" && $data->auth_cookie=="")
      {
          
          $this->activeUser[$user->id]="Anonymous - ".  uniqid();
          $this->channel["default"][]="Welcome " . $this->activeUser[$user->id];
          $this->send($user, json_encode(array("activeUsers" => $this->activeUser ,"channel"=>$this->channel)));      
          $this->updateUsers();
      }  
      if($data->action=="chat")
      {
          
          $this->channel["default"][]=  html_entity_decode($this->activeUser[$user->id]. ": ".$data->text);
          
          $this->send($user, json_encode(array("activeUsers" => $this->activeUser, "channel"=>$this->channel)));        
          $this->updateUsers();
      }
      
      
      
      if($data->action =="update" && $data->uid>0)
      {
          //here we just update given user
          $this->send($user, "close");
          foreach($this->users as $user){
              if($user->uid == $data->uid)
              {
                  $notifications = new Notification;
                  $res=$notifications->getNotificationsByID($data->uid);
                  $this->send($user, json_encode($res));
              }
          }
          
      }
  }
  
  function updateUsers(){
      foreach($this->users as $user){
             
            $this->send($user, json_encode(array("activeUsers" => $this->activeUser, "channel"=>$this->channel)));        
              
          }
  }
  
  protected function connected ($user) {
     
      $notifications = new Notification;
      //remove some old notifications first aka garbage collection
      $notifications->cleanup();
      
      
  }
  
  
  
  protected function closed ($user) {
    // Do nothing: This is where cleanup would go, in case the user had any sort of
    // open files or other objects associated with them.  This runs after the socket 
    // has been closed, so there is no need to clean up the socket itself here.
      unset($this->activeUser[$user->id]);
      
      $this->updateUsers();
      
      echo "closed";
      
  }
}

$newsserver = new notificationServer("0.0.0.0","9000");

try {
  $newsserver->run();
  
}
catch (Exception $e) {
  $newsserver->stdout($e->getMessage());
}