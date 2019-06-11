<template>
    <Page>
        <WrapLayout backgroundColor="white">

            <StackLayout verticalAlignment="center">
                <Label class="edit__time-picker-label" text="Время начала" />
            </StackLayout>          
            <TimePicker class="edit__time-picker" v-model="note.startDate" />

            <StackLayout verticalAlignment="center">
                <Label class="edit__time-picker-label" text="Время конца" />
            </StackLayout>     
            <TimePicker class="edit__time-picker" v-model="note.endDate" />              
          <TextField ref="newNoteField" v-model="note.noteText" class="edit__new-note-text" 
            @focus="isCreatingNewNote = true" @returnPress = "createNewNote" />
          <Button text="OK" class="edit__new-note-button" @tap="$modal.close(note)"/>                   
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
            }
        }
    }, 
    created() {
        this.note.noteText = this.noteObject.title
        this.note.startDate = this.noteObject.startDate
        this.note.endDate = this.noteObject.endDate
        this.note.id = this.noteObject.id
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
