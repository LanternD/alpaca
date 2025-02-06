class TimePickerModalFactory {
    static createModal(type) {
        switch (type) {
            case 'short': // 800M, 5K
                return new ShortTimePickerModal();
            case 'long':  // 10K及以上
                return new LongTimePickerModal();
            default:
                throw new Error('Unknown modal type');
        }
    }
}

// 基础的 Modal 类
class BaseTimePickerModal {
    constructor() {
        this.modal = document.createElement('div');
        this.modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50';
        document.body.appendChild(this.modal);
        
        this.itemHeight = 48;
        this.paddingCount = Math.floor(48 * 2 / this.itemHeight);
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

    // ... 其他共用方法 ...
}

// 短距离时间选择器（分:秒）
class ShortTimePickerModal extends BaseTimePickerModal {
    constructor() {
        super();
        this.setupModal();
        this.setupEventListeners();
    }

    setupModal() {
        this.modal.innerHTML = `
            <div class="bg-white rounded-lg p-4 w-80">
                <div class="text-center mb-4">
                    <h3 class="text-lg font-medium">调整时间</h3>
                </div>
                <div class="flex justify-center gap-8">
                    <div class="text-center w-24">
                        <div class="text-sm text-gray-600 mb-2">分</div>
                        <div class="h-48 overflow-hidden relative">
                            <div id="minutesPickerShort" class="absolute inset-0 overflow-y-auto snap-y snap-mandatory hide-scrollbar">
                            </div>
                            <div class="absolute inset-x-0 top-1/2 -translate-y-6 h-12 bg-blue-50/50 pointer-events-none"></div>
                            <div class="absolute inset-0 w-full pointer-events-none bg-gradient-to-b from-white via-transparent to-white"></div>
                        </div>
                    </div>
                    <div class="text-center w-24">
                        <div class="text-sm text-gray-600 mb-2">秒</div>
                        <div class="h-48 overflow-hidden relative">
                            <div id="secondsPickerShort" class="absolute inset-0 overflow-y-auto snap-y snap-mandatory hide-scrollbar">
                            </div>
                            <div class="absolute inset-x-0 top-1/2 -translate-y-6 h-12 bg-blue-50/50 pointer-events-none"></div>
                            <div class="absolute inset-0 w-full pointer-events-none bg-gradient-to-b from-white via-transparent to-white"></div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 flex justify-end">
                    <button id="confirmTimeAdjustShort" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none">
                        确定
                    </button>
                </div>
            </div>
        `;

        this.minutesPicker = this.modal.querySelector('#minutesPickerShort');
        this.secondsPicker = this.modal.querySelector('#secondsPickerShort');
        this.confirmButton = this.modal.querySelector('#confirmTimeAdjustShort');

        this.initializePickers();
    }

    initializePickers() {
        // 分钟选项 (0-59)
        this.minutesPicker.innerHTML = this.createPaddingElements() +
            Array.from({length: 60}, (_, i) => i)
                .map(num => this.createPickerItem(num))
                .join('') +
            this.createPaddingElements();

        // 秒数选项 (0-59)
        this.secondsPicker.innerHTML = this.createPaddingElements() +
            Array.from({length: 60}, (_, i) => i)
                .map(num => this.createPickerItem(num, true))
                .join('') +
            this.createPaddingElements();
    }

    show(minutes, seconds) {
        this.modal.classList.remove('hidden');
        
        const minutesScrollTop = (minutes + this.paddingCount) * this.itemHeight;
        const secondsScrollTop = (seconds + this.paddingCount) * this.itemHeight;
        
        this.minutesPicker.scrollTop = minutesScrollTop;
        this.secondsPicker.scrollTop = secondsScrollTop;

        this.updateHighlight(this.minutesPicker);
        this.updateHighlight(this.secondsPicker);
    }

    onConfirm(callback) {
        this.confirmButton.addEventListener('click', () => {
            setTimeout(() => {
                [this.minutesPicker, this.secondsPicker].forEach(picker => {
                    this.updateHighlight(picker);
                });

                const minutesHighlighted = this.minutesPicker.querySelector('.text-blue-600');
                const secondsHighlighted = this.secondsPicker.querySelector('.text-blue-600');
                
                if (minutesHighlighted && secondsHighlighted) {
                    const selectedMinute = parseInt(minutesHighlighted.dataset.value);
                    const selectedSecond = parseInt(secondsHighlighted.dataset.value);
                    callback(selectedMinute, selectedSecond, 0);
                }

                this.hide();
            }, 100);
        });
    }
}

// 长距离时间选择器（时:分:秒）
class LongTimePickerModal extends BaseTimePickerModal {
    // ... 实现与当前的 TimePickerModal 类似，但包含小时选择器 ...
}

export { TimePickerModalFactory }; 