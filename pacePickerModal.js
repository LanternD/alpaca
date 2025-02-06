class PacePickerModal {
    constructor() {
        this.modal = document.getElementById('paceAdjustModal');
        this.minutesPicker = document.getElementById('minutesPicker');
        this.secondsPicker = document.getElementById('secondsPicker');
        this.confirmButton = document.getElementById('confirmPaceAdjust');
        
        this.itemHeight = 48;
        this.paddingCount = Math.floor(48 * 2 / this.itemHeight);
        
        this.initializePickers();
        this.setupEventListeners();
    }

    initializePickers() {
        // 分钟选项 (2-20)
        this.minutesPicker.innerHTML = this.createPaddingElements() +
            Array.from({length: 19}, (_, i) => i + 2)
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
        [this.minutesPicker, this.secondsPicker].forEach(picker => {
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

    show(currentMinutes, currentSeconds) {
        console.log('显示配速调整模态框');
        this.modal.classList.remove('hidden');
        
        // 设置初始滚动位置
        const minutesScrollTop = (currentMinutes - 2 + this.paddingCount) * this.itemHeight;
        const secondsScrollTop = (currentSeconds + this.paddingCount) * this.itemHeight;
        
        this.minutesPicker.scrollTop = minutesScrollTop;
        this.secondsPicker.scrollTop = secondsScrollTop;

        // 初始化高亮
        this.updateHighlight(this.minutesPicker);
        this.updateHighlight(this.secondsPicker);
    }

    hide() {
        this.modal.classList.add('hidden');
    }

    onConfirm(callback) {
        this.confirmButton.addEventListener('click', () => {
            // 先对选择器进行平滑滚动
            [this.minutesPicker, this.secondsPicker].forEach(picker => {
                this.snapToClosestItem(picker);
            });

            setTimeout(() => {
                // 强制更新一次高亮状态
                [this.minutesPicker, this.secondsPicker].forEach(picker => {
                    this.updateHighlight(picker);
                });

                const minutesHighlighted = this.minutesPicker.querySelector('.text-blue-600');
                const secondsHighlighted = this.secondsPicker.querySelector('.text-blue-600');

                if (minutesHighlighted && secondsHighlighted) {
                    const selectedMinute = parseInt(minutesHighlighted.dataset.value, 10);
                    const selectedSecond = parseInt(secondsHighlighted.dataset.value, 10);
                    callback(selectedMinute, selectedSecond);
                }

                this.hide();
            }, 200); // 延时200ms，确保滚动完成
        });
        
        // 绑定 touchstart 事件以确保移动设备能触发
        this.confirmButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // 手动触发 click 事件逻辑
            this.confirmButton.click();
        });
    }
}

export default PacePickerModal; 