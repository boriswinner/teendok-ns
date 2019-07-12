<template>
    <Page>
      <ScrollView>
        <WrapLayout backgroundColor="white">         
            <StackLayout verticalAlignment="center">
                <Label class="edit__time-picker-label" text="Начало:" />
            </StackLayout>          
            <DatePicker class="edit__date-picker" v-model="startDateForm" />
            <TimePicker class="edit__time-picker" @loaded="setTimePicker24h" v-model="startTimeForm" />

            <StackLayout verticalAlignment="center">
                <Label class="edit__time-picker-label" text="Конец:" />
            </StackLayout>          
            <DatePicker class="edit__time-picker" v-model="endDateForm" /> 
            <TimePicker class="edit__time-picker" @loaded="setTimePicker24h" v-model="endTimeForm" />              

          <TextField ref="newNoteField" v-model="event.name" class="edit__new-note-text" 
            @focus="isCreatingNewNote = true" @returnPress = "createNewNote" />
          <Button text="OK" class="edit__new-note-button" @tap="closeNote"/>                   
          <Button v-if="noteObject" text="Удалить заметку" class="edit__delete-note-button" @tap="createNewNote"/>    
        </WrapLayout>
        </ScrollView>
    </Page>
</template>

<script>
import { isIOS, isAndroid } from "platform";
var application = require('application');  

export default {
    name: 'NoteCreateEdit',
    props: {
      event: {
        type: Object,
        default () {
          return {
            id: null,
            startDate: new Date(),
            endDate: new Date(),
            name: "",
            details:"",
            status: null,
            location: null,
            timezone: null
          }
        }
      }
    },
    data (){
        return {
            startDateForm: null,
            endDateForm: null,
            startTimeForm: null,
            endTimeForm: null
        }
    }, 
    created() {
      if (this.event){
        this.startDateForm = this.event.startDate
        this.startTimeForm = this.event.startDate
        this.endDateForm = this.event.endDate
        this.endTimeForm = this.event.endDate
      }
    },
    methods: {
      closeNote () { 
        this.event.startDate = new Date(
          this.startDateForm.getYear(),
          this.startDateForm.getMonth(),
          this.startDateForm.getDay(),
          this.startTimeForm.getHours(),
          this.startTimeForm.getMinutes(),
        )
        this.event.endDate = new Date(
          this.endDateForm.getYear(),
          this.endDateForm.getMonth(),
          this.endDateForm.getDay(),
          this.endTimeForm.getHours(),
          this.endTimeForm.getMinutes(),
        )        
        this.$modal.close(this.note)      
      },
      setTimePicker24h (event){
        // THIS WILL WORK ONLY ON ANDROID, BUT IT IS POSSIBLE TO ADOPT FOR IOS
        let picker = event.object.nativeView
        picker.setIs24HourView(java.lang.Boolean.TRUE)
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

    .edit {

      &__time-picker-label {
        width: 100%;
      }

      &__time-picker {
        height: 20%;
        width: 100%;
      }

      &__date-picker {
        height: 20%;
        width: 100%;
      }

      &__new-note-text {
        width: 75%;
        height: 10%;
      }

      &__new-note-button{
        width: 25%;
      }      

      &__delete-note-button {
          width: 100%;
          background-color: #ED0A51;
          color: white;
      }
    }
</style>
