import PacePickerModal from './pacePickerModal.js';
import { TimePickerModalFactory } from './timePickerModalFactory.js';

class TimePickerManager {
    constructor() {
        this.pacePickerModal = new PacePickerModal();
        this.shortTimePickerModal = TimePickerModalFactory.createModal('short');
        this.longTimePickerModal = TimePickerModalFactory.createModal('long');
        
        this.timeInputs = {
            '800m': { type: 'short', ids: ['800mMinutes', '800mSeconds'] },
            '5k': { type: 'short', ids: ['5kMinutes', '5kSeconds'] },
            '10k': { type: 'long', ids: ['10kHours', '10kMinutes', '10kSeconds'] },
            '20k': { type: 'long', ids: ['20kHours', '20kMinutes', '20kSeconds'] },
            'halfMarathon': { type: 'long', ids: ['halfMarathonHours', 'halfMarathonMinutes', 'halfMarathonSeconds'] },
            'marathon': { type: 'long', ids: ['marathonHours', 'marathonMinutes', 'marathonSeconds'] }
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 配速调整按钮
        const adjustPaceBtn = document.getElementById('adjustPaceBtn');
        const adjustPaceBtnMile = document.getElementById('adjustPaceBtnMile');

        if (adjustPaceBtn) {
            adjustPaceBtn.addEventListener('click', () => {
                console.log('点击配速调整按钮');
                this.showPacePicker();
            });
            adjustPaceBtn.addEventListener('touchstart', () => {
                console.log('触摸配速调整按钮');
                this.showPacePicker();
            });
        }

        if (adjustPaceBtnMile) {
            adjustPaceBtnMile.addEventListener('click', () => {
                console.log('点击英里配速调整按钮');
                this.showPacePicker();
            });
            adjustPaceBtnMile.addEventListener('touchstart', () => {
                console.log('触摸英里配速调整按钮');
                this.showPacePicker();
            });
        }

        // 时间调整按钮
        const adjustButtons = {
            '800m': document.getElementById('adjust800m'),
            '5k': document.getElementById('adjust5k'),
            '10k': document.getElementById('adjust10k'),
            '20k': document.getElementById('adjust20k'),
            'halfMarathon': document.getElementById('adjustHalfMarathon'),
            'marathon': document.getElementById('adjustMarathon')
        };

        // 为每个时间调整按钮添加事件监听
        Object.entries(adjustButtons).forEach(([key, button]) => {
            if (button) {
                button.addEventListener('click', () => {
                    console.log(`点击${key}调整按钮`);
                    this.showTimePicker(key, this.timeInputs[key]);
                });
                button.addEventListener('touchstart', (e) => {
                    console.log(`触摸${key}调整按钮`);
                    this.showTimePicker(key, this.timeInputs[key]);
                });
            }
        });
    }

    showPacePicker() {
        const paceMinutesInput = document.getElementById(this.isKm ? 'paceMinutes' : 'paceMilesMinutes');
        const paceSecondsInput = document.getElementById(this.isKm ? 'paceSeconds' : 'paceMilesSeconds');
        
        const currentMinutes = parseInt(paceMinutesInput.value);
        const currentSeconds = parseInt(paceSecondsInput.value);
        
        this.pacePickerModal.show(currentMinutes, currentSeconds);
    }

    showTimePicker(key, inputConfig) {
        const { type, ids } = inputConfig;
        const modal = type === 'short' ? this.shortTimePickerModal : this.longTimePickerModal;
        
        const hours = ids.length === 3 ? parseInt(document.getElementById(ids[0]).value) : 0;
        const minutes = parseInt(document.getElementById(ids[ids.length - 2]).value);
        const seconds = parseInt(document.getElementById(ids[ids.length - 1]).value);

        this.currentTimeKey = key;
        this.currentTimeInputIds = ids;
        modal.show(minutes, seconds, hours);
    }

    setIsKm(value) {
        this.isKm = value;
    }

    onPaceConfirm(callback) {
        this.pacePickerModal.onConfirm(callback);
    }

    onTimeConfirm(callback) {
        // 为短距离和长距离选择器分别设置确认回调
        this.shortTimePickerModal.onConfirm((selectedMinute, selectedSecond) => {
            const inputIds = this.currentTimeInputIds;
            document.getElementById(inputIds[0]).value = selectedMinute;
            document.getElementById(inputIds[1]).value = selectedSecond.toString().padStart(2, '0');
            callback(selectedMinute, selectedSecond, 0, this.currentTimeKey);
        });

        this.longTimePickerModal.onConfirm((selectedMinute, selectedSecond, selectedHour) => {
            const inputIds = this.currentTimeInputIds;
            document.getElementById(inputIds[0]).value = selectedHour;
            document.getElementById(inputIds[1]).value = selectedMinute.toString().padStart(2, '0');
            document.getElementById(inputIds[2]).value = selectedSecond.toString().padStart(2, '0');
            callback(selectedMinute, selectedSecond, selectedHour, this.currentTimeKey);
        });
    }
}

export default TimePickerManager; 