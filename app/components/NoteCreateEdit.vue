<template>
    <Page>
      <ScrollView>
        <WrapLayout backgroundColor="white">         
            <StackLayout verticalAlignment="center">
                <Label textWrap="true" class="edit__time-picker-label" text="Начало события (если событие повторяется, минимальные дата и время, в которое может начаться событие):" />
            </StackLayout>          
            <DatePicker class="edit__date-picker" v-model="startDateForm" />
            <TimePicker class="edit__time-picker" @loaded="setTimePicker24h" v-model="startTimeForm" />

            <StackLayout verticalAlignment="center">
                <Label textWrap="true" class="edit__time-picker-label" text="Конец события: (если событие повторяется, остальные экземпляры создаются аналогичным образом с такой же длительностью):" />
            </StackLayout>          
            <DatePicker class="edit__time-picker" v-model="durationDateForm" /> 
            <TimePicker class="edit__time-picker" @loaded="setTimePicker24h" v-model="durationTimeForm" />              
            <StackLayout verticalAlignment="center">
                <Label textWrap="true" class="edit__time-picker-label" :text="repeatFrequencyForm ? 'Повторять каждые...' : ''" />
            </StackLayout>                      
            <ListPicker class="edit__repeat-picker" :items="Object.keys(repeatFrequencies)" v-model="repeatFrequencyForm" />            
            <TextField v-show="repeatFrequencyForm" class="edit__repeat-input" keyboardType="number" v-model="repeatIntervalForm" />            
            <StackLayout v-show="repeatFrequencyForm == 2" verticalAlignment="center">
                <Label textWrap="true" class="edit__time-picker-label" text="По каким дням недели повторять событие?" />
            </StackLayout>                   
            <button v-show="repeatFrequencyForm == 2" v-for="(item,index) in Object.keys(byDay)" 
                    :class="{'edit__weekday-button-active' : byDayForm[index] == true}" :key="index+item" @tap="byDayForm[index] = !byDayForm[index]; $forceUpdate();" :text="item"/>         
            <StackLayout v-show="repeatFrequencyForm" verticalAlignment="center">
                <Label textWrap="true" class="edit__time-picker-label" text="Максимальные дата и время, в которое может начаться событие:" />
            </StackLayout>                              
            <DatePicker v-show="repeatFrequencyForm" class="edit__time-picker" v-model="endDateForm" /> 
            <TimePicker v-show="repeatFrequencyForm" class="edit__time-picker" @loaded="setTimePicker24h" v-model="endTimeForm" />            
            <!-- <TextField v-show="repeatFrequencyForm" class="edit__new-note-text" keyboardType="number" v-model="repeatCountForm" hint="(Опционально) Введите количество повторений..." /> -->
          <TextField v-model="event.name" class="edit__new-note-text" hint="имя события..." />
          <TextField v-model="event.details" class="edit__new-note-text" hint="описание события..."/>
          <Button text="OK" class="edit__new-note-button" @tap="closeNote"/>                   
          <Button v-if="event" @tap="deleteNote" text="Удалить заметку" class="edit__delete-note-button"/>    
        </WrapLayout>
        </ScrollView>
    </Page>
</template>

<script>
import { isIOS, isAndroid } from "platform";
var application = require('application');  
import ServerCommunicationMixin from '@/components/ServerCommunicationMixin'

export default {
    mixins: [ServerCommunicationMixin],     
    name: 'NoteCreateEdit',
    props: {
      event: {
        type: Object,
        default () {
          return {
            id: null,
            startDate: new Date(),
            duration: new Date(),
            endDate: new Date(),
            patternEndDate: new Date(),
            name: "",
            details:"",
            status: null,
            location: null,
            timezone: null,
            rrule: null
          }
        }
      },
      selectedDay: {
        default: null
      }
    },
    computed: {
      isByDayButtonActive (index) {
        return byDayForm[index]
      }
    },
    data (){
        return {
            startDateForm: new Date(),
            startTimeForm: new Date(),
            durationDateForm: new Date(),
            durationTimeForm: new Date(),
            endDateForm: new Date(),
            endTimeForm: new Date(),
            repeatFrequencies: {
              'Без повторений': null,
              'День': 'DAILY',
              'Неделю': 'WEEKLY',
              'Месяц': 'MONTHLY',
              'Год': 'YEARLY'
            },
            byDay: {
              'ПН': "MO",
              'ВТ' : "TU",
              'СР' : "WE",
              'ЧТ' : "TH",
              'ПТ' : 'FR',
              'СБ' : "SA",
              'ВС' : "SU"
            },
            repeatFrequencyForm: null,
            repeatIntervalForm: 1,
            repeatCountForm: '',
            byDayForm: new Array(7).fill(false)
        }
    }, 
    methods: {
      getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
      },      
      closeNote () { 
        this.event.startDate = new Date(
          this.startDateForm.getFullYear(),
          this.startDateForm.getMonth(),
          this.startDateForm.getDate(),
          this.startTimeForm.getHours(),
          this.startTimeForm.getMinutes(),
        )
        let singleEventEndDate = new Date(
          this.durationDateForm.getFullYear(),
          this.durationDateForm.getMonth(),
          this.durationDateForm.getDate(),
          this.durationTimeForm.getHours(),
          this.durationTimeForm.getMinutes(),
        )
        this.event.duration = singleEventEndDate - this.event.startDate
        this.event.endDate = null
        if (this.repeatFrequencyForm){
          this.event.endDate = new Date(
            this.endDateForm.getFullYear(),
            this.endDateForm.getMonth(),
            this.endDateForm.getDate(),
            this.endTimeForm.getHours(),
            this.endTimeForm.getMinutes(),
          )          
          console.log(Object.keys(this.repeatFrequencies)[this.repeatFrequencyForm])
          this.event.rrule = "FREQ="+this.repeatFrequencies[Object.keys(this.repeatFrequencies)[this.repeatFrequencyForm]]+';INTERVAL='+this.repeatIntervalForm
          if (this.repeatFrequencies[Object.keys(this.repeatFrequencies)[this.repeatFrequencyForm]] == 'WEEKLY'){
            this.event.rrule += ';BYDAY='
            for (const [key, value] of Object.entries(this.byDayForm)) {
              if (value){
                this.event.rrule += this.byDay[Object.keys(this.byDay)[key]] + ','
              }
            }            
            this.event.rrule = this.event.rrule.slice(0, -1) //remove last ','
          }
          console.log(this.event.rrule)
        }
        if (+this.event.startDate > +singleEventEndDate){
          alert('Событие должно заканчиваться позже, чем началось!')
        } else{
          this.$modal.close(this.event)      
        }
      },
      deleteNote () {
        this.$modal.close('delete')      
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
      for (var property in this.event) {
        console.log( property + ': ' + this.event[property]+'; ')
      }       
      if (this.selectedDay){
        this.event.startDate = this.selectedDay
        this.event.endDate = this.selectedDay
      }
      this.startDateForm = this.event.startDate
      this.startTimeForm = this.event.startDate
      this.durationDateForm = this.event.endDate
      this.durationTimeForm = this.event.endDate 
      this.endDateForm = this.event.patternEndDate
      this.endTimeForm = this.event.patternEndDate
      if (this.event.rrule){
        let freqSTr = this.event.rrule.match(/FREQ=[A-z]+/i)
        if (freqSTr){
          this.repeatFrequencyForm = Object.values(this.repeatFrequencies).indexOf(freqSTr[0].slice(5))
        }         
        let intervalStr = this.event.rrule.match(/INTERVAL=[0-9]+/i)
        if (intervalStr){
          this.repeatIntervalForm = intervalStr[0].slice(9)
        }
        let byDayArr = this.event.rrule.match(/BYDAY=[A-z,]+/gi);
        if (byDayArr){
          byDayArr = byDayArr[0].slice(6).split(',')
          console.log(byDayArr)
          byDayArr.forEach(element => {
            this.byDayForm[Object.values(this.byDay).indexOf(element)] = true            
          });
          console.log(this.byDayForm)
        }        
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
        width: 100%;
        height: 10%;
      }

      &__new-note-button{
        width: 100%;
      }      

      &__delete-note-button {
          width: 100%;
          background-color: #ED0A51;
          color: white;
      }

      &__repeat-input {
        width: 30%;
      }

      &__repeat-picker {
          width: 70%;
      }

      &__weekday-button-active {
        background-color: aqua
      }
    }
</style>
