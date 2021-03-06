import axios from "axios";
var qs = require('qs');
const fs = require("tns-core-modules/file-system");
import { ShareFile } from 'nativescript-share-file';
import { Mediafilepicker, FilePickerOptions } from 'nativescript-mediafilepicker';
import { isIOS, isAndroid } from "platform";
import * as Toast from 'nativescript-toast';
import HelpersMixin from './HelpersMixin';

export default {
   mixins: [HelpersMixin],      
   data () {
      return {
         serverEvents: [],
         serverInstances: [],
         serverPatterns: [],        
         axiosAuthorized: null,         
      }
   },
   computed: {
      firebaseToken () {
         return this.$store.getters.getFirebaseToken
      },
      FirebaseUID () {
         return this.$store.getters.getFirebaseUID
      }      
   },
   created() {
      let vi = this
      this.axiosAuthorized = axios.create({
          paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'}),
          headers: {"X-Firebase-Auth": vi.firebaseToken}
      });      
      // debug only
      this.axiosAuthorized.interceptors.request.use(request => {
        console.log('Starting Request', request)
        return request
      })                
      axios.interceptors.request.use(request => {
         console.log('Starting Request', request)
         return request
       })         
   },
   methods: {
      getNotesFromServer () {
         let vi = this
         this.$store.commit('clearNotes') 
         let tempAxios = this.axiosAuthorized
   
         tempAxios.get(vi.APIurl+"events").then(result => {
           console.log(result.data)
           vi.serverEvents = result.data.data
           vi.serverEvents = vi.serverEvents.reduce(function(map, obj) {
               map[obj.id] = obj;
               return map;
           }, {});        
           let event_ids = result.data.data.map(a => parseInt(a.id, 10))   
           return tempAxios.get(vi.APIurl+"events/instances", {
             params: {
               "id": event_ids,
             },              
           }).then(result => {
               console.log(result.data)
               vi.serverInstances = result.data.data
               return tempAxios.get(vi.APIurl+"patterns", {
                 params: {
                   "events": event_ids,
                 },                       
               }).then(result => {
                 console.log(result.data)
                 vi.serverPatterns = result.data.data  
                 vi.serverPatterns = vi.serverPatterns.reduce(function(map, obj) {
                     map[obj.event_id] = obj;
                     return map;
                 }, {});
               }).catch(function (error) {
                 console.log(error);
               }).finally(function () {
                 console.log('------')
                 console.log(vi.serverInstances.length)
                 vi.serverInstances.forEach(function (i, index) {
                   let t = {
                     id: i.event_id,
                     patternID: vi.serverPatterns[i.event_id].id,
                     startDate: new Date(i.started_at),
                     endDate: new Date(i.ended_at),
                     duration: i.ended_at-i.started_at,
                     patternStartDate: new Date(vi.serverPatterns[i.event_id].started_at),
                     patternEndDate: new Date(vi.serverPatterns[i.event_id].ended_at),
                     name: vi.serverEvents[i.event_id].name,
                     details: vi.serverEvents[i.event_id].details,
                     status: vi.serverEvents[i.event_id].status,
                     location: vi.serverEvents[i.event_id].location,
                     timezone: vi.serverPatterns[i.event_id].timezone,
                     rrule: vi.serverPatterns[i.event_id].rrule
                   }
                   console.log(t)
                   vi.$store.commit('addNote', t) 
                 })
               });                       
           }).catch(function (error) {
           console.log(error);
           })            
         }).catch(function (error) {
           console.log(error);
         })
      },
      updateNoteOnServer(eventID, patternID, details, location, name, status, started_at, ended_at, duration, rrule){
         let vi = this
         let tempAxios = this.axiosAuthorized   
         console.log(started_at)  
         console.log(ended_at)  
         tempAxios.patch(vi.APIurl+"events/"+eventID, {
             details: details,
             location: location,
             name: name,
             status: status,            
         }).then(result => {
           console.log('post event')
           console.log(result.data)
           console.log('updatePattern')            
           let params = {
            started_at: started_at.getTime(),
            duration: duration,
            rrule: rrule                        
           }       
           //this is КОСТЫЛЬ because of server's bug             
           if (ended_at != null){
              params['ended_at'] = ended_at.getTime()
           }
           tempAxios.patch("http://planner.skillmasters.ga/api/v1/patterns/"+patternID, params)
           .then(result => {
             console.log('POST PATTERN SUCCESS')
             console.log(result.data)
             var toast = Toast.makeText("Событие обновлено!");
             toast.show();             
             vi.getNotesFromServer()
           }).catch(function (error) {                      
             console.log('post event error')
             console.log(error);
             var toast = Toast.makeText("Не удалось обновить событие");
             toast.show();                 
             vi.getNotesFromServer()
           })  
         }).catch(function (error) {                      
           console.log('post event error')
           console.log(error);
           var toast = Toast.makeText("Не удалось обновить событие");
           toast.show();             
           vi.getNotesFromServer()
         })             
      },
      pushNoteToServer(details, location, name, status, started_at, ended_at, duration, rrule) {
         let vi = this
         let tempAxios = this.axiosAuthorized     
         tempAxios.post(vi.APIurl+"events", {
             details: details,
             location: location,
             name: name,
             status: status,            
         }).then(result => {
           console.log('post event')
           console.log(result.data)
           let eventID = result.data.data[0].id
           let params = {
            started_at: started_at.getTime(),
            duration: duration,
            rrule: rrule                        
           }       
           //this is КОСТЫЛЬ because of server's bug             
           if (ended_at != null){
              params['ended_at'] = ended_at.getTime()
           }
           tempAxios.post("http://planner.skillmasters.ga/api/v1/patterns/?event_id="+eventID, params)
           .then(result => {
             console.log('POST PATTERN SUCCESS')
             console.log(result.data)
             var toast = Toast.makeText("Событие создано!");
             toast.show();                          
             vi.getNotesFromServer()
           }).catch(function (error) {
             console.log('post event error')
             console.log(error);
             var toast = Toast.makeText("Не удалось создать событие");
             toast.show();                          
           })  
         }).catch(function (error) {         
           console.log('post event error')
           console.log(error);
           var toast = Toast.makeText("Не удалось создать событие");
           toast.show();                          
         })        
       },   
       deleteEventFromServer (eventID) {
         let vi = this
         let tempAxios = this.axiosAuthorized
         tempAxios.delete(vi.APIurl+"events/"+eventID)
         .then(result => {
           var toast = Toast.makeText("Событие удалено!");
           toast.show();           
           console.log(result)  
           vi.getNotesFromServer() 
         }).catch(function (error) {
            var toast = Toast.makeText("Не удалось удалить событие");
            toast.show();           
            console.log(error);
            vi.getNotesFromServer()
          })            
       },  
       getPermissions (isMine){
        let vi = this
        let tempAxios = this.axiosAuthorized
        return tempAxios.get(vi.APIurl+"permissions/",{
          params: {
            entity_type: 'EVENT',
            mine: isMine
          }
        }).then(res =>{
          return res.data.data                
        }).catch(error => {
          console.log(error)
        })         
       },
       activatePermissions (link) {
         let vi = this
         let tempAxios = this.axiosAuthorized
         tempAxios.get(link)
         .then(result => {
           console.log(result)      
           var toast = Toast.makeText("Права получены!");
           toast.show();      
           vi.getNotesFromServer()      
         }).catch(function (error) {
          var toast = Toast.makeText("Не удалось получить права");
          toast.show();                        
          console.log(error);
        })  
       },
       sharePermissions (actions, event){
         let vi = this
         let tempAxios = this.axiosAuthorized
         let params = []
         actions.forEach( action => {
           params.push({
              action: action,
              entity_id: event ? event.id : null,
              entity_type: 'EVENT'             
           })
           params.push({
            action: action,
            entity_id: event ? event.patternID : null,
            entity_type: 'PATTERN'             
         })           
         })
         return tempAxios.post("http://planner.skillmasters.ga/api/v1/share", params)
         .then(result => {
            return result.data.split("/").pop()
          }).catch(function (error) {
             console.log(error);
           })                     
       },
       revokePermission (id){
        let vi = this
        let tempAxios = this.axiosAuthorized
        return tempAxios.delete(vi.APIurl+"permissions/"+id)
        .then(result => {
          var toast = Toast.makeText("Разрешение удалено!");
          toast.show();                              
          return result
        }).catch(error => {
          var toast = Toast.makeText("Не удалось удалить разрешение...");
          toast.show();          
          console.log(error)
        })
       },
       exportCalendarServer () {
         let tempAxios = this.axiosAuthorized
         tempAxios.get("http://planner.skillmasters.ga/api/v1/export/")
         .then(exportedCalendarString => {
            const documents = fs.knownFolders.documents();
            const folder = documents.getFolder("calendarExport");
            const file = folder.getFile("export.ics");
            file.writeText(exportedCalendarString.data.toString())
                .then((result) => {
                   console.log('file saved')
                   var toast = Toast.makeText("Файл записан в: "+file._path);
                   toast.show();             
                   let shareFile = new ShareFile();   
                   shareFile.open( { 
                     path: file._path, 
                     intentTitle: 'Отправить экспортированный календарь:', // optional Android
                 });                                   
                }).catch((err) => {
                    console.log(err);
                });
          }).catch(function (error) {
             console.log(error);
         }) 
       },
       postCalendarStringToServer (calendarString){
         console.log(calendarString)
         let vi = this
         let tempAxios = this.axiosAuthorized
         let params = {
          str: calendarString
         }
         tempAxios.post("http://planner.skillmasters.ga/api/v1/import/raw",  params)
         .then((result) => {
            console.log(result)
         }).catch((err) => {
            console.log(err);
         });
       },
       getUserById(idStr){
         let vi = this
         let tempAxios = this.axiosAuthorized
         let params = {
          user_id: idStr
         }
         return tempAxios.get(vi.APIurl+"user?user_id="+idStr)
         .then(result => {
           return result.data
         }).catch((err) => {
          console.log(err);
         });
       },
       importCalendarFromFS () {
         let vi = this
         let extensions = ['ics'];
          
         let options = {
             android: {
                 extensions: extensions,
                 maxNumberFiles: 1
             },
             ios: {
                 extensions: extensions,
                 multipleSelection: true
             }
         };
          
         let mediafilepicker = new Mediafilepicker(); 
         mediafilepicker.openFilePicker(options);
          
         mediafilepicker.on("getFiles", function (res) {
             let results = res.object.get('results');
             console.dir(results);
             let calendarFile = fs.File.fromPath(results[0].file)
             calendarFile.readText()
             .then((res) => {
               console.log(res)
               vi.postCalendarStringToServer(res)
             }).catch((err) => {
              console.log(err);
           });
         });
          
         mediafilepicker.on("error", function (res) {
             let msg = res.object.get('msg');
             console.log(msg);
         });
          
         mediafilepicker.on("cancel", function (res) {
             let msg = res.object.get('msg');
             console.log(msg);
         });          
       }
   }
}