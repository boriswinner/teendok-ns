import axios from "axios";
var qs = require('qs');
const fs = require("tns-core-modules/file-system");
import { ShareFile } from 'nativescript-share-file';
import { Mediafilepicker, FilePickerOptions } from 'nativescript-mediafilepicker';
import { isIOS, isAndroid } from "platform";
import * as Toast from 'nativescript-toast';

export default {
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
   
         tempAxios.get("http://planner.skillmasters.ga/api/v1/events", {headers: {
           "X-Firebase-Auth": vi.firebaseToken
         }}).then(result => {
           console.log(result.data)
           if (!result.data.success) return
           vi.serverEvents = result.data.data
           vi.serverEvents = vi.serverEvents.reduce(function(map, obj) {
               map[obj.id] = obj;
               return map;
           }, {});        
           // console.log(this.serverEvents)
           let event_ids = result.data.data.map(a => parseInt(a.id))   
           // console.log(event_ids)
           return tempAxios.get("http://planner.skillmasters.ga/api/v1/events/instances", {
             headers: {
               "X-Firebase-Auth": vi.firebaseToken
             },
             params: {
               "id": event_ids,
             },              
           }).then(result => {
             console.log(result.data)
               if (!result.data.success) return
               vi.serverInstances = result.data.data
               return tempAxios.get("http://planner.skillmasters.ga/api/v1/patterns", {
                 headers: {
                   "X-Firebase-Auth": vi.firebaseToken
                 },
                 params: {
                   "events": event_ids,
                 },                       
               }).then(result => {
                 console.log(result.data)
                 if (!result.data.success) return
                 vi.serverPatterns = result.data.data  
                 vi.serverPatterns = vi.serverPatterns.reduce(function(map, obj) {
                     map[obj.event_id] = obj;
                     return map;
                 }, {});
                 console.log('PATTETNS')
                 console.log(vi.serverPatterns)                              
               }).catch(function (error) {
               console.log(error);
               }).finally(function () {
                 console.log('------')
                 console.log(vi.serverInstances.length)
                 vi.serverInstances.forEach(function (i, index) {
                   // console.log(i)
                   // console.log(i.event_id)
                   // console.log(vi.serverEvents)
                   let t = {
                     id: i.event_id,
                     patternID: vi.serverPatterns[i.event_id].id,
                     startDate: new Date(i.started_at),
                     endDate: new Date(i.ended_at),
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
         tempAxios.patch("http://planner.skillmasters.ga/api/v1/events/"+eventID, {
             details: details,
             location: location,
             name: name,
             status: status,            
         }).then(result => {
           console.log('post event')
           console.log(result.data)
           let eventID = result.data.data[0].id
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
             this.getNotesFromServer()
           }).catch(function (error) {
             console.log('post event error')
             console.log(error);
           })  
         }).catch(function (error) {
           console.log('post event error')
           console.log(error);
         })             
      },
      pushNoteToServer(details, location, name, status, started_at, ended_at, duration, rrule) {
         let vi = this
         let tempAxios = this.axiosAuthorized     
         tempAxios.post("http://planner.skillmasters.ga/api/v1/events", {
             details: details,
             location: location,
             name: name,
             status: status,            
         }).then(result => {
           console.log('post event')
           console.log(result.data)
           let eventID = result.data.data[0].id
           console.log(eventID)
           console.log('pushPattern')            
           console.log(started_at)
           console.log(ended_at)  
           console.log(started_at.getTime())
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
             this.getNotesFromServer()
           }).catch(function (error) {
             console.log('post event error')
             console.log(error);
           })  
         }).catch(function (error) {
           console.log('post event error')
           console.log(error);
         })        
       },   
       deleteEventFromServer (eventID) {
         let vi = this
         let tempAxios = this.axiosAuthorized
         console.log(eventID)  
         console.log(this.serverPatterns)
         console.log(this.serverPatterns)
         let patternID = vi.serverPatterns[eventID].id
         tempAxios.delete("http://planner.skillmasters.ga/api/v1/events/"+eventID)
         .then(result => {
           console.log(result)   
         }).catch(function (error) {
            console.log(error);
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
         }).catch(function (error) {
          console.log(error);
        })  
       },
       sharePermissions (actions){
         let vi = this
         let tempAxios = this.axiosAuthorized
         let params = []
         actions.forEach( action => {
           params.push({
              action: action,
              entity_id: null,
              entity_type: 'EVENT'             
           })
         })
         return tempAxios.post("http://planner.skillmasters.ga/api/v1/share", params)
         .then(result => {
            console.log('SERVER RESULT')
            return result.data
          }).catch(function (error) {
             console.log(error);
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
                   let shareFile = new ShareFile();   
                   shareFile.open( { 
                     path: file._path, 
                     intentTitle: 'Отправить экспортированный календарь:', // optional Android
                     rect: { // optional iPad
                         x: 110,
                         y: 110,
                         width: 0,
                         height: 0
                     },
                     options: true, // optional iOS
                     animated: true // optional iOS
                 });                                   
                }).catch((err) => {
                    console.log(err);
                });
          }).catch(function (error) {
             console.log(error);
         }) 
       },
       postCalendarFileToServer (calendarFile){
         console.log(calendarFile)
         console.log(typeof calendarFile)
         let formData = new FormData();
         formData.append("file", calendarFile);
         console.log('>> formData >> ', formData);
         let vi = this
         axios.post("http://planner.skillmasters.ga/api/v1/import",  formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              "X-Firebase-Auth": vi.firebaseToken
            }
         })
         .then((result) => {
            console.log(result)
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
             var bghttp = require("nativescript-background-http");
             var session = bghttp.session("file-upload");              
             var request = {
               url: "http://planner.skillmasters.ga/api/v1/import",
               method: "POST",
               headers: {
                   "Content-Type": "application/octet-stream",
                   "X-Firebase-Auth": vi.firebaseToken
               },
               description: "Uploading "
             };
             var task = session.uploadFile(results[0].file, request);  
             task.on("error", (res) => {
               console.log(res)
             });
             task.on("responded",  (res) => {
              console.log(res)
            });
             task.on("complete",  (res) => {
              console.log(res)
            });           
          //    let calendarFile = fs.File.fromPath(results[0].file)
          //    calendarFile.readText()
          //    .then((res) => {
          //     //  console.log(res)
          //     //  let blob = new Blob([res.toString()], {type: 'text/plain'});
          //     //  console.log(blob)
          //     //  vi.postCalendarFileToServer(blob)
          //    }).catch((err) => {
          //     console.log(err);
          //  });
            //  console.log(calendarFile)
            //  vi.postCalendarFileToServer(calendarFile)
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