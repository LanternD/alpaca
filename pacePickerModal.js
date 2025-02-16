class PacePickerModal {
    constructor() {
        console.log('初始化 PacePickerModal');
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
        console.log('Modal 元素已添加到 body');
        
        this.minutesPicker = this.modal.querySelector('#minutesPicker');
        this.secondsPicker = this.modal.querySelector('#secondsPicker');
        this.confirmButton = this.modal.querySelector('#confirmPaceBtn');
        
        if (!this.minutesPicker || !this.secondsPicker || !this.confirmButton) {
            console.error('未找到必要的 modal 元素');
        }
        
        this.itemHeight = 48;
        this.paddingCount = Math.floor(48 * 2 / this.itemHeight);
        
        // 初始化 Bootstrap modal
        try {
            this.bsModal = new bootstrap.Modal(this.modal);
            console.log('Bootstrap modal 初始化成功');
        } catch (error) {
            console.error('Bootstrap modal 初始化失败:', error);
        }
        
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
        return `<div class="picker-item d-flex align-items-center justify-content-center snap-center" 
                     style="height: ${this.itemHeight}px;" 
                     data-value="${value}">
                    ${displayValue}
                </div>`;
    }

    createPaddingElements() {
        return Array(this.paddingCount).fill(`<div class="picker-item" style="height: ${this.itemHeight}px;"></div>`).join('');
    }

    setupEventListeners() {
        [this.minutesPicker, this.secondsPicker].forEach(picker => {
            // 使用 throttle 减少滚动事件的触发频率
            let lastTime = 0;
            picker.addEventListener('scroll', () => {
                const now = Date.now();
                if (now - lastTime >= 50) {  // 每50ms最多触发一次
                    this.updateHighlight(picker);
                    lastTime = now;
                }
            });
        });

        // 添加触摸结束事件监听
        [this.minutesPicker, this.secondsPicker].forEach(picker => {
            picker.addEventListener('touchend', () => {
                this.snapToClosestItem(picker);
            });
        });
    }

    updateHighlight(picker) {
        const items = picker.querySelectorAll('.picker-item');
        const middlePosition = picker.scrollTop + picker.offsetHeight / 2;
        let closestItem = null;
        let minDistance = Infinity;
        
        items.forEach(item => {
            if (!item.dataset.value) return;  // 跳过填充元素
            
            const itemMiddle = item.offsetTop + item.offsetHeight / 2;
            const distance = Math.abs(itemMiddle - middlePosition);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });
        
        // 只选中最近的项
        items.forEach(item => {
            if (item === closestItem) {
                this.selectItem(item);
            } else {
                item.classList.remove('text-primary', 'fw-bold', 'selected');
            }
        });
    }

    selectItem(item) {
        // 移除同级元素的选中状态
        const picker = item.closest('.overflow-auto');
        picker.querySelectorAll('.picker-item').forEach(i => {
            i.classList.remove('text-primary', 'fw-bold', 'selected');
        });
        
        // 添加选中状态
        item.classList.add('text-primary', 'fw-bold', 'selected');
    }

    snapToClosestItem(picker) {
        const middlePosition = picker.scrollTop + picker.offsetHeight / 2;
        const items = picker.querySelectorAll('.picker-item[data-value]');
        let closestItem = null;
        let minDistance = Infinity;
        
        items.forEach(item => {
            const itemMiddle = item.offsetTop + item.offsetHeight / 2;
            const distance = Math.abs(itemMiddle - middlePosition);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        });
        
        if (closestItem) {
            const targetScrollTop = closestItem.offsetTop - (picker.offsetHeight - closestItem.offsetHeight) / 2;
            picker.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
            
            // 选中最近的项
            this.selectItem(closestItem);
        }
    }

    onConfirm(callback) {
        this.confirmButton.addEventListener('click', () => {
            const minutesSelected = this.minutesPicker.querySelector('.selected');
            const secondsSelected = this.secondsPicker.querySelector('.selected');
            
            // 如果没有选中的值，使用当前高亮的值
            const minutesValue = minutesSelected ? 
                parseInt(minutesSelected.dataset.value) :
                parseInt(this.minutesPicker.querySelector('.text-primary')?.dataset.value);
                
            const secondsValue = secondsSelected ? 
                parseInt(secondsSelected.dataset.value) :
                parseInt(this.secondsPicker.querySelector('.text-primary')?.dataset.value);
            
            if (minutesValue !== undefined && secondsValue !== undefined) {
                callback(minutesValue, secondsValue);
            }
            
            this.hide();
        });
    }

    show(currentMinutes, currentSeconds) {
        console.log('显示配速选择器:', currentMinutes, currentSeconds);
        this.bsModal.show();
        
        // 等待 modal 显示完成后再设置滚动位置
        setTimeout(() => {
            // 计算滚动位置，考虑填充元素的高度
            const minutesScrollTop = (currentMinutes - 2 + this.paddingCount) * this.itemHeight;
            const secondsScrollTop = (currentSeconds + this.paddingCount) * this.itemHeight;
            
            // 设置滚动位置并选中当前值
            this.scrollAndSelect(this.minutesPicker, minutesScrollTop, currentMinutes);
            this.scrollAndSelect(this.secondsPicker, secondsScrollTop, currentSeconds);
        }, 100);
    }

    scrollAndSelect(picker, scrollTop, value) {
        // 设置滚动位置
        picker.scrollTop = scrollTop;
        
        // 找到并选中对应的值
        const items = picker.querySelectorAll('.picker-item[data-value]');
        items.forEach(item => {
            if (parseInt(item.dataset.value) === value) {
                this.selectItem(item);
            } else {
                item.classList.remove('text-primary', 'fw-bold', 'selected');
            }
        });
    }

    hide() {
        this.bsModal.hide();
    }
}

export default PacePickerModal; 