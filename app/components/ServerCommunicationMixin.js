import axios from "axios";
var qs = require('qs');

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
   },
   created() {
      let vi = this
      this.axiosAuthorized = axios.create({
          paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'}),
          headers: {"X-Firebase-Auth": vi.firebaseToken}
      });      
      //debug only
      // this.axiosAuthorized.interceptors.request.use(request => {
      //   console.log('Starting Request', request)
      //   return request
      // })                
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
                     startDate: new Date(i.started_at),
                     endDate: new Date(i.ended_at),
                     name: vi.serverEvents[i.event_id].name,
                     details: vi.serverEvents[i.event_id].details,
                     status: vi.serverEvents[i.event_id].status,
                     location: vi.serverEvents[i.event_id].location,
                     timezone: vi.serverPatterns[i.event_id].timezone
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
      pushNoteToServer(details, location, name, status, started_at, ended_at) {
         let event = {
           details: details,
           location: location,
           name: name,
           status: status,
         }
         let pattern = {
           started_at: started_at,
           ended_at: ended_at
         }
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
           tempAxios.post("http://planner.skillmasters.ga/api/v1/patterns/?event_id="+eventID, {
             pattern: {
               started_at: started_at.getTime(),
               ended_at: ended_at.getTime(),              
             }
           }).then(result => {
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
       
         // if (event.startDate > event.endDate){
         //   alert('Некорректное время!')
         // } else {
         //   this.$store.commit('addNote', event)          
         // }
       },      
   }
}