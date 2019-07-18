<template>
    <Page class="page">
        <ActionBar class="action-bar" title="Vue Mapbox Example"></ActionBar>
        <GridLayout>
            <label :text="location"/>
                <Mapbox
                    accessToken="YOUR-ACCESS-TOKEN-HERE"
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
                latitude: "37.7397",
                longtitude: "-121.4252"
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
                    vi.location.latitude = loc.latitude
                    vi.location.longtitude = loc.longitude
                    console.log('1111111111111111111111111111111111111')
                    console.log(vi.location.latitude)
                    console.log(vi.location.longtitude)              
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
