class TimePickerModal {
    constructor() {
        this.modal = document.createElement('div');
        this.modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50';
        this.setupModal();
        document.body.appendChild(this.modal);
        
        this.itemHeight = 48;
        this.paddingCount = Math.floor(48 * 2 / this.itemHeight);
        
        this.initializePickers();
        this.setupEventListeners();
    }

    setupModal() {
        this.modal.innerHTML = `
            <div class="bg-white rounded-lg p-4 w-96">
                <div class="text-center mb-4">
                    <h3 class="text-lg font-medium">调整时间</h3>
                </div>
                <div class="flex justify-center gap-6">
                    <div class="text-center w-24">
                        <div class="text-sm text-gray-600 mb-2">时</div>
                        <div class="h-48 overflow-hidden relative">
                            <div id="hoursPickerTime" class="absolute inset-0 overflow-y-auto snap-y snap-mandatory hide-scrollbar">
                            </div>
                            <div class="absolute inset-x-0 top-1/2 -translate-y-6 h-12 bg-blue-50/50 pointer-events-none"></div>
                            <div class="absolute inset-0 w-full pointer-events-none bg-gradient-to-b from-white via-transparent to-white"></div>
                        </div>
                    </div>
                    <div class="text-center w-24">
                        <div class="text-sm text-gray-600 mb-2">分</div>
                        <div class="h-48 overflow-hidden relative">
                            <div id="minutesPickerTime" class="absolute inset-0 overflow-y-auto snap-y snap-mandatory hide-scrollbar">
                            </div>
                            <div class="absolute inset-x-0 top-1/2 -translate-y-6 h-12 bg-blue-50/50 pointer-events-none"></div>
                            <div class="absolute inset-0 w-full pointer-events-none bg-gradient-to-b from-white via-transparent to-white"></div>
                        </div>
                    </div>
                    <div class="text-center w-24">
                        <div class="text-sm text-gray-600 mb-2">秒</div>
                        <div class="h-48 overflow-hidden relative">
                            <div id="secondsPickerTime" class="absolute inset-0 overflow-y-auto snap-y snap-mandatory hide-scrollbar">
                            </div>
                            <div class="absolute inset-x-0 top-1/2 -translate-y-6 h-12 bg-blue-50/50 pointer-events-none"></div>
                            <div class="absolute inset-0 w-full pointer-events-none bg-gradient-to-b from-white via-transparent to-white"></div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 flex justify-end">
                    <button id="confirmTimeAdjust" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none">
                        确定
                    </button>
                </div>
            </div>
        `;

        this.hoursPicker = this.modal.querySelector('#hoursPickerTime');
        this.minutesPicker = this.modal.querySelector('#minutesPickerTime');
        this.secondsPicker = this.modal.querySelector('#secondsPickerTime');
        this.confirmButton = this.modal.querySelector('#confirmTimeAdjust');
    }

    initializePickers() {
        // 小时选项 (0-23)
        this.hoursPicker.innerHTML = this.createPaddingElements() +
            Array.from({length: 24}, (_, i) => i)
                .map(num => this.createPickerItem(num, true))
                .join('') +
            this.createPaddingElements();

        // 分钟选项 (0-59)
        this.minutesPicker.innerHTML = this.createPaddingElements() +
            Array.from({length: 60}, (_, i) => i)
                .map(num => this.createPickerItem(num, true))
                .join('') +
            this.createPaddingElements();

        // 秒数选项 (0-59)
        this.secondsPicker.innerHTML = this.createPaddingElements() +
            Array.from({length: 60}, (_, i) => i)
                .map(num => this.createPickerItem(num, true))
                .join('') +
            this.createPaddingElements();
    }

    createPaddingElements() {
        return Array(this.paddingCount).fill('')
            .map(() => `<div class="h-12 flex items-center justify-center snap-center opacity-0" data-value="padding"></div>`)
            .join('');
    }

    createPickerItem(num, padZero = false) {
        const displayNum = padZero ? num.toString().padStart(2, '0') : num;
        return `<div class="h-12 flex items-center justify-center snap-center text-lg font-medium" data-value="${num}">${displayNum}</div>`;
    }

    setupEventListeners() {
        // 点击背景关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // 为选择器添加滚动事件
        [this.hoursPicker, this.minutesPicker, this.secondsPicker].forEach(picker => {
            let isScrolling;
            
            picker.addEventListener('scroll', () => {
                window.clearTimeout(isScrolling);
                this.updateHighlight(picker);
                isScrolling = setTimeout(() => this.snapToClosestItem(picker), 150);
            });

            picker.addEventListener('touchend', () => {
                this.snapToClosestItem(picker);
            });
        });
    }

    updateHighlight(picker) {
        const items = Array.from(picker.children).filter(item => item.dataset.value !== 'padding');
        const centerY = picker.scrollTop + picker.offsetHeight / 2;
        
        items.forEach(item => {
            const itemCenter = item.offsetTop + item.offsetHeight / 2;
            const distance = Math.abs(centerY - itemCenter);
            
            if (distance < this.itemHeight / 2) {
                item.classList.add('text-blue-600');
            } else {
                item.classList.remove('text-blue-600');
            }
        });
    }

    snapToClosestItem(picker) {
        const currentScroll = picker.scrollTop;
        const targetScroll = Math.round(currentScroll / this.itemHeight) * this.itemHeight;
        
        picker.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

        setTimeout(() => this.updateHighlight(picker), 200);
    }

    show(minutes, seconds, hours = 0) {
        this.modal.classList.remove('hidden');
        
        // 设置初始滚动位置
        const hoursScrollTop = (hours + this.paddingCount) * this.itemHeight;
        const minutesScrollTop = (minutes + this.paddingCount) * this.itemHeight;
        const secondsScrollTop = (seconds + this.paddingCount) * this.itemHeight;
        
        this.hoursPicker.scrollTop = hoursScrollTop;
        this.minutesPicker.scrollTop = minutesScrollTop;
        this.secondsPicker.scrollTop = secondsScrollTop;

        // 初始化高亮
        this.updateHighlight(this.hoursPicker);
        this.updateHighlight(this.minutesPicker);
        this.updateHighlight(this.secondsPicker);
    }

    hide() {
        this.modal.classList.add('hidden');
    }

    onConfirm(callback) {
        this.confirmButton.addEventListener('click', () => {
            setTimeout(() => {
                // 强制更新一次高亮状态
                [this.hoursPicker, this.minutesPicker, this.secondsPicker].forEach(picker => {
                    this.updateHighlight(picker);
                });

                const hoursHighlighted = this.hoursPicker.querySelector('.text-blue-600');
                const minutesHighlighted = this.minutesPicker.querySelector('.text-blue-600');
                const secondsHighlighted = this.secondsPicker.querySelector('.text-blue-600');
                
                if (hoursHighlighted && minutesHighlighted && secondsHighlighted) {
                    const selectedHour = parseInt(hoursHighlighted.dataset.value);
                    const selectedMinute = parseInt(minutesHighlighted.dataset.value);
                    const selectedSecond = parseInt(secondsHighlighted.dataset.value);
                    callback(selectedMinute, selectedSecond, selectedHour);
                }

                this.hide();
            }, 100);
        });
    }
}

export default TimePickerModal; 