import axios from "axios";
var qs = require('qs');
const fileSystemModule = require("tns-core-modules/file-system");

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
       sharePermissions (action, entity_id, entity_type){
         console.log(this.FirebaseUID)
         let tempAxios = this.axiosAuthorized
         let params = [
            {
               action: 'READ',
               entity_id: this.FirebaseUID,
               entity_type: 'EVENT'
            }]         
         tempAxios.post("http://planner.skillmasters.ga/api/v1/share", params)
         .then(result => {
            console.log(result)   
          }).catch(function (error) {
             console.log(error);
           })                     
       },
       exportCalendarServer () {
         let tempAxios = this.axiosAuthorized
         tempAxios.get("http://planner.skillmasters.ga/api/v1/export/")
         .then(result => {
            console.log(Object.keys(result))
            console.log(result.data) 
            // const folder = fileSystemModule.knownFolders.documents().path;
            // const fileName = "picture.png";
            // const path = fileSystemModule.path.join(folder,fileName);
            // const picsaved = imageSource.saveToFile(path, "ics");
            // if (picsaved){
            //    console.log('saved')
            // }              
          }).catch(function (error) {
             console.log(error);
         }) 
       }
   }
}