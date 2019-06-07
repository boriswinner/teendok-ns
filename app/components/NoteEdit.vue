<template>
    <Page>
        <WrapLayout backgroundColor="white">

            <StackLayout verticalAlignment="center">
                <Label class="home__time-picker-label" text="Время начала" />
            </StackLayout>          
            <TimePicker class="home__time-picker" v-model="noteStartTime" />

            <StackLayout verticalAlignment="center">
                <Label class="home__time-picker-label" text="Время конца" />
            </StackLayout>     
            <TimePicker class="home__time-picker" v-model="noteEndTime" />              
          <TextField ref="newNoteField" v-model="noteText" class="home__new-note-text" 
            @focus="isCreatingNewNote = true" @returnPress = "createNewNote" />
          <Button text="+" class="home__new-note-button" @tap="createNewNote"/>                   
        </WrapLayout>
    </Page>
</template>

<script>
export default {
    name: 'NoteEdit',
    props: ['noteObject'],
    data (){
        return {
            noteText: null,
            noteStartDate: null,
            noteEndDate: null,
        }
    }, 
    created() {
        console.log('---------')
        console.log(this.noteObject)
        this.noteText = this.noteObject.noteText
        this.noteStartDate = this.noteObject.startDate
        this.noteEndDate = this.noteObject.endDate
    }
}
</script>

<style>

</style>
