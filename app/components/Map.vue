<template>
    <Page class="page">
        <ActionBar class="action-bar" title="Vue Mapbox Example"></ActionBar>
        <GridLayout>
            <label :text="location"/>
                <Mapbox
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
    },
    computed: {
    },
    data (){
        return {
            location: {
                //это местоположение дефолтное для либы карты
                latitude: "37.7397",
                longtitude: "-121.4252",
                eventMarker: null,
                isEventCreated: true
            },
        }
    }, 
    methods: {   
        onMapReady(args) {
            geolocation.enableLocationRequest();
            let vi = this
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high, maximumAge: 5000, timeout: 20000 })
            .then( loc => {
                if (loc) {
                    vi.location.latitude = parseFloat(loc.latitude)
                    vi.location.longtitude = parseFloat(loc.longitude)
                    args.map.setCenter(
                        {
                            lat: vi.location.latitude,
                            lng: vi.location.longtitude,
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
        }            
    },
    mounted () {
      if (isAndroid) {
          application.android.on(application.AndroidApplication.activityBackPressedEvent, this.$modal.close);
      }                     
    }
}
</script>

<style scoped lang="scss">
</style>
