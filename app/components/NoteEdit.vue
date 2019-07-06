<template>
    <Page>
        <WrapLayout backgroundColor="white">

            <StackLayout verticalAlignment="center">
                <Label class="edit__time-picker-label" text="Время начала" />
            </StackLayout>          
            <TimePicker class="edit__time-picker" @loaded="setTimePicker24h" v-model="startTime" />

            <StackLayout verticalAlignment="center">
                <Label class="edit__time-picker-label" text="Время конца" />
            </StackLayout>     
            <TimePicker class="edit__time-picker" @loaded="setTimePicker24h" v-model="endTime" />              
          <TextField ref="newNoteField" v-model="note.noteText" class="edit__new-note-text" 
            @focus="isCreatingNewNote = true" @returnPress = "createNewNote" />
          <Button text="OK" class="edit__new-note-button" @tap="closeNote"/>                   
          <Button text="Удалить заметку" class="edit__delete-note-button" @tap="createNewNote"/>    
        </WrapLayout>
    </Page>
</template>

<script>
export default {
    name: 'NoteEdit',
    props: ['noteObject'],
    data (){
        return {
            note: {
                noteText: null,
                startDate: null,
                endDate: null,
                id: null
            },
            startTime: null,
            endTime: null
        }
    }, 
    created() {
        this.note.noteText = this.noteObject.title
        this.note.startDate = this.noteObject.startDate
        this.note.endDate = this.noteObject.endDate
        this.note.id = this.noteObject.id
        this.startTime = this.noteObject.startDate
        this.endTime = this.noteObject.endDate
    },
    methods: {
      closeNote () {
        this.note.startDate.setHours(this.startTime.getHours())
        this.note.startDate.setMinutes(this.startTime.getMinutes())        
        this.note.endDate.setHours(this.endTime.getHours())
        this.note.endDate.setMinutes(this.endTime.getMinutes())  
        this.$modal.close(this.note)      
      },
      setTimePicker24h (event){
        // THIS WILL WORK ONLY ON ANDROID, BUT IT IS POSSIBLE TO ADOPT FOR IOS
        let picker = event.object.nativeView
        picker.setIs24HourView(java.lang.Boolean.TRUE)
      }      
    }
}
</script>

<style scoped lang="scss">

    .edit {

      &__time-picker-label {
        width: 40%;
      }

      &__time-picker {
        height: 20%;
        width: 60%;
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
