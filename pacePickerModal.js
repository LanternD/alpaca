class PacePickerModal {
    constructor() {
        // 创建 modal 元素
        this.modal = document.createElement('div');
        this.modal.className = 'modal fade';
        this.modal.id = 'pacePickerModal';
        this.modal.setAttribute('tabindex', '-1');
        
        // 设置 modal 内容
        this.modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">调整配速</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex justify-content-center gap-4">
                            <div class="text-center" style="width: 120px;">
                                <div class="text-muted mb-2">分</div>
                                <div class="position-relative" style="height: 192px;">
                                    <div id="minutesPicker" class="position-absolute top-0 bottom-0 w-100 overflow-auto hide-scrollbar snap-y">
                                    </div>
                                    <div class="position-absolute start-0 end-0 top-50 translate-middle-y picker-highlight" style="height: 48px;"></div>
                                    <div class="position-absolute inset-0 w-100 picker-gradient"></div>
                                </div>
                            </div>
                            <div class="text-center" style="width: 120px;">
                                <div class="text-muted mb-2">秒</div>
                                <div class="position-relative" style="height: 192px;">
                                    <div id="secondsPicker" class="position-absolute top-0 bottom-0 w-100 overflow-auto hide-scrollbar snap-y">
                                    </div>
                                    <div class="position-absolute start-0 end-0 top-50 translate-middle-y picker-highlight" style="height: 48px;"></div>
                                    <div class="position-absolute inset-0 w-100 picker-gradient"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="confirmPaceBtn">确定</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        this.minutesPicker = this.modal.querySelector('#minutesPicker');
        this.secondsPicker = this.modal.querySelector('#secondsPicker');
        this.confirmButton = this.modal.querySelector('#confirmPaceBtn');
        
        this.itemHeight = 48;
        this.paddingCount = Math.floor(48 * 2 / this.itemHeight);
        
        // 初始化 Bootstrap modal
        this.bsModal = new bootstrap.Modal(this.modal);
        
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

    createPickerItem(value, padZero = false) {
        const displayValue = padZero ? value.toString().padStart(2, '0') : value;
        return `<div class="picker-item d-flex align-items-center justify-content-center" style="height: ${this.itemHeight}px;" data-value="${value}">${displayValue}</div>`;
    }

    createPaddingElements() {
        return Array(this.paddingCount).fill(`<div class="picker-item" style="height: ${this.itemHeight}px;"></div>`).join('');
    }

    setupEventListeners() {
        [this.minutesPicker, this.secondsPicker].forEach(picker => {
            picker.addEventListener('scroll', () => this.updateHighlight(picker));
        });
    }

    updateHighlight(picker) {
        const items = picker.querySelectorAll('.picker-item');
        const middlePosition = picker.scrollTop + picker.offsetHeight / 2;
        
        items.forEach(item => {
            const itemMiddle = item.offsetTop + item.offsetHeight / 2;
            const distance = Math.abs(itemMiddle - middlePosition);
            
            if (distance < item.offsetHeight / 2) {
                item.classList.add('text-primary', 'fw-bold');
                console.log('高亮项:', item.textContent);
            } else {
                item.classList.remove('text-primary', 'fw-bold');
            }
        });
    }

    snapToClosestItem(picker) {
        const middlePosition = picker.scrollTop + picker.offsetHeight / 2;
        const items = picker.querySelectorAll('.picker-item');
        let closestItem = null;
        let minDistance = Infinity;
        
        items.forEach(item => {
            if (!item.dataset.value) return;
            
            const itemMiddle = item.offsetTop + item.offsetHeight / 2;
            const distance = Math.abs(itemMiddle - middlePosition);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });
        
        if (closestItem) {
            picker.scrollTo({
                top: closestItem.offsetTop - (picker.offsetHeight - closestItem.offsetHeight) / 2,
                behavior: 'smooth'
            });
        }
    }

    onConfirm(callback) {
        this.confirmButton.addEventListener('click', () => {
            [this.minutesPicker, this.secondsPicker].forEach(picker => {
                this.snapToClosestItem(picker);
            });
            
            setTimeout(() => {
                const minutesHighlighted = this.minutesPicker.querySelector('.text-primary');
                const secondsHighlighted = this.secondsPicker.querySelector('.text-primary');
                
                if (minutesHighlighted && secondsHighlighted) {
                    const selectedMinute = parseInt(minutesHighlighted.dataset.value, 10);
                    const selectedSecond = parseInt(secondsHighlighted.dataset.value, 10);
                    callback(selectedMinute, selectedSecond);
                }
                
                this.hide();
            }, 200);
        });
    }

    show(currentMinutes, currentSeconds) {
        console.log('显示配速选择器:', currentMinutes, currentSeconds);
        this.bsModal.show();
        
        setTimeout(() => {
            const minutesScrollTop = (currentMinutes - 2 + this.paddingCount) * this.itemHeight;
            const secondsScrollTop = (currentSeconds + this.paddingCount) * this.itemHeight;
            
            this.minutesPicker.scrollTop = minutesScrollTop;
            this.secondsPicker.scrollTop = secondsScrollTop;
            
            this.updateHighlight(this.minutesPicker);
            this.updateHighlight(this.secondsPicker);

            this.snapToClosestItem(this.minutesPicker);
            this.snapToClosestItem(this.secondsPicker);
        }, 100);
    }

    hide() {
        this.bsModal.hide();
    }
}

export default PacePickerModal; 