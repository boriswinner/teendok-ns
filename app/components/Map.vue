<template>
    <Page class="page">
        <GridLayout rows="6*, *" columns="*">
                <Mapbox
                    row="0"
                    col="0"
                    accessToken="pk.eyJ1IjoiYm9yaXN3aW5uZXIiLCJhIjoiY2p5OGEzNWp4MDdnazNtbzBmZTZzM3c3cyJ9.WU1xX0VyUITsi8YTygl7CQ"
                    mapStyle="traffic_day"
                    :latitude="location.latitude"
                    :longitude="location.longtitude"
                    hideCompass="true"
                    zoomLevel="12"
                    showUserLocation="false"
                    disableZoom="false"
                    disableRotation="false"
                    disableScroll="false"
                    disableTilt="false"
                    @mapReady="onMapReady($event)">
                </Mapbox>
                <Button row="1" column="0" text="ОК" @tap="sendMarker"/>
        </GridLayout>
    </Page>
</template>

<script>
var geolocation = require("nativescript-geolocation");
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import { isIOS, isAndroid } from "platform";
var application = require('application');  

export default {   
    name: 'Map',
    props: {
        eventMarker: null
    },
    computed: {
    },
    data (){
        return {
            location: {
                //это местоположение дефолтное для либы карты
                latitude: "37.7397",
                longtitude: "-121.4252",
                isEventCreated: true
            },
        }
    }, 
    methods: {   
        onMapReady(args) {
            let vi = this            
            if (vi.eventMarker){
                vi.isEventCreated = true
                args.map.addMarkers([vi.eventMarker]);  
            }
            geolocation.enableLocationRequest();
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high, maximumAge: 5000, timeout: 20000 })
            .then( loc => {
                if (loc) {
                    vi.location.latitude = parseFloat(loc.latitude)
                    vi.location.longtitude = parseFloat(loc.longitude)
                    args.map.setCenter(
                        {
                            lat: vi.eventMarker ? vi.eventMarker.lat : vi.location.latitude,
                            lng: vi.eventMarker ? vi.eventMarker.lng : vi.location.longtitude,
                        }
                    );
                    args.map.setOnMapClickListener((point) => {
                        let markerData = {
                                lat: point.lat,
                                lng: point.lng,    
                                title: "Местоположение события",
                            }
                        if (!vi.isEventCreated){
                            vi.eventMarker = markerData
                            vi.isEventCreated = true                            
                            args.map.addMarkers([vi.eventMarker]);                                                     
                        } else {
                            vi.eventMarker.update(markerData)
                        }
                    });                                                                                
                }          
            }).catch(err => {
                console.log(err)
            })
        },
        sendMarker(){
            this.$modal.close(this.eventMarker)     
        }            
    },
    mounted () {
      console.log(this.eventMarker)
      if (isAndroid) {
          application.android.on(application.AndroidApplication.activityBackPressedEvent, this.$modal.close);
      }                     
    }
}
</script>

<style scoped lang="scss">
</style>
