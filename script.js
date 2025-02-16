import PacePickerModal from './pacePickerModal.js';

// 在文件顶部声明全局变量
let isKm = true; // 默认使用公里

document.addEventListener('DOMContentLoaded', function() {

    // 定义 timeInputs 对象
    const timeInputs = {
        '800m': ['800mMinutes', '800mSeconds'],
        '5k': ['5kMinutes', '5kSeconds'],
        '10k': ['10kHours', '10kMinutes', '10kSeconds'],
        'halfMarathon': ['halfMarathonHours', 'halfMarathonMinutes', 'halfMarathonSeconds'],
        'marathon': ['marathonHours', 'marathonMinutes', 'marathonSeconds']
    };

    // 初始化配速选择器
    const pacePickerModal = new PacePickerModal();

    // 配速调整按钮事件
    const adjustPaceBtn = document.getElementById('adjustPaceBtn');
    if (adjustPaceBtn) {
        adjustPaceBtn.addEventListener('click', showPacePicker);
        adjustPaceBtn.addEventListener('touchstart', showPacePicker);
    }

    const adjustPaceBtnMile = document.getElementById('adjustPaceBtnMile');
    if (adjustPaceBtnMile) {
        adjustPaceBtnMile.addEventListener('click', showPacePicker);
        adjustPaceBtnMile.addEventListener('touchstart', showPacePicker);
    }

    function showPacePicker() {
        let currentMinutes, currentSeconds;
        if (isKm) {
            [currentMinutes, currentSeconds] = document.getElementById('kmPaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
        } else {
            [currentMinutes, currentSeconds] = document.getElementById('milePaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
        }
        pacePickerModal.show(currentMinutes, currentSeconds);
    }

    // 处理配速确认
    pacePickerModal.onConfirm((selectedMinute, selectedSecond) => {
        console.log('配速选择器确认:', selectedMinute, selectedSecond);  // 调试日志
        if (isKm) {
            document.getElementById('kmPaceDisplay').textContent = 
                `${selectedMinute}:${selectedSecond.toString().padStart(2, '0')}`;
        } else {
            document.getElementById('milePaceDisplay').textContent = 
                `${selectedMinute}:${selectedSecond.toString().padStart(2, '0')}`;
        }
        updateTimes();  // 确保在更新配速后调用更新时间
    });

    // 修改单位切换功能
    const toggleButton = document.getElementById('unitToggle');
    const kmPace = document.getElementById('kmPace');
    const milePace = document.getElementById('milePace');

    // 设置初始状态
    toggleButton.setAttribute('data-state', isKm ? 'KM' : 'MI');
    if (!isKm) {
        kmPace.style.display = 'none';
        milePace.style.display = 'block';
    }

    function handleToggle() {
        // 在切换前获取当前配速
        let currentPaceSeconds;
        if (isKm) {
            const [minutes, seconds] = document.getElementById('kmPaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            currentPaceSeconds = minutes * 60 + seconds;
            
            // 切换到英里，需要将公里配速转换为英里配速
            const miPaceSeconds = currentPaceSeconds * 1.609344;
            const miMinutes = Math.floor(miPaceSeconds / 60);
            const miSeconds = Math.round(miPaceSeconds % 60);
            
            // 更新显示状态
            kmPace.style.display = 'none';
            milePace.style.display = 'block';
            
            // 更新英里配速显示
            document.getElementById('milePaceDisplay').textContent = 
                `${miMinutes}:${miSeconds.toString().padStart(2, '0')}`;
        } else {
            const [minutes, seconds] = document.getElementById('milePaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            currentPaceSeconds = minutes * 60 + seconds;
            
            // 切换到公里，需要将英里配速转换为公里配速
            const kmPaceSeconds = currentPaceSeconds / 1.609344;
            const kmMinutes = Math.floor(kmPaceSeconds / 60);
            const kmSeconds = Math.round(kmPaceSeconds % 60);
            
            // 更新显示状态
            kmPace.style.display = 'block';
            milePace.style.display = 'none';
            
            // 更新公里配速显示
            document.getElementById('kmPaceDisplay').textContent = 
                `${kmMinutes}:${kmSeconds.toString().padStart(2, '0')}`;
        }

        // 切换单位标志
        isKm = !isKm;
        
        // 更新切换按钮状态
        toggleButton.setAttribute('data-state', isKm ? 'KM' : 'MI');

        // 更新等效配速显示
        updateEquivalentPace();
        
        // 更新速度显示
        updateSpeeds();

        // 如果当前在速查表页面，重新生成表格
        const tableTab = document.querySelector('#table.active');
        if (tableTab) {
            generatePaceTable();
        }
    }

    // 添加点击和触摸事件监听
    if (toggleButton) {
        toggleButton.addEventListener('click', handleToggle);
        toggleButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleToggle();
        });
    }

    function updateTimes() {
        const distances = {
            '800m': 0.8,
            '5k': 5,
            '10k': 10,
            'halfMarathon': 21.0975,
            'marathon': 42.195
        };

        // 获取当前配速（秒/公里）
        let totalPaceSeconds;
        if (isKm) {
            const [paceMinutes, paceSeconds] = document.getElementById('kmPaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            totalPaceSeconds = paceMinutes * 60 + paceSeconds;
            console.log('当前公里配速(秒):', totalPaceSeconds);  // 调试日志
        } else {
            const [paceMinutes, paceSeconds] = document.getElementById('milePaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            totalPaceSeconds = (paceMinutes * 60 + paceSeconds) * 0.621371;
            console.log('当前英里配速(秒):', totalPaceSeconds);  // 调试日志
        }

        // 根据配速计算各个距离的时间
        if (totalPaceSeconds > 0) {
            for (const [key, distance] of Object.entries(distances)) {
                const newTotalSeconds = totalPaceSeconds * distance;
                const newHours = Math.floor(newTotalSeconds / 3600);
                const newMinutes = Math.floor((newTotalSeconds % 3600) / 60);
                const newSeconds = Math.round(newTotalSeconds % 60);

                // 更新隐藏的输入框
                const ids = timeInputs[key];
                if (ids.length === 2) {
                    document.getElementById(ids[0]).value = newMinutes;
                    document.getElementById(ids[1]).value = newSeconds.toString().padStart(2, '0');
                } else {
                    document.getElementById(ids[0]).value = newHours;
                    document.getElementById(ids[1]).value = newMinutes.toString().padStart(2, '0');
                    document.getElementById(ids[2]).value = newSeconds.toString().padStart(2, '0');
                }

                // 更新显示的时间
                const displayElement = document.getElementById(`${key}Display`);
                if (displayElement) {
                    if (newHours > 0) {
                        displayElement.textContent = `${newHours}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
                    } else {
                        displayElement.textContent = `${newMinutes}:${newSeconds.toString().padStart(2, '0')}`;
                    }
                }
            }
        }

        updateEquivalentPace();
        updateSpeeds();
    }

    function updateEquivalentPace() {
        if (isKm) {
            const [minutes, seconds] = document.getElementById('kmPaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            const totalSeconds = (minutes * 60 + seconds) / 0.621371;
            const mileMinutes = Math.floor(totalSeconds / 60);
            const mileSeconds = Math.round(totalSeconds % 60);
            document.getElementById('kmPaceMileEquiv').textContent = `(${mileMinutes}:${mileSeconds.toString().padStart(2, '0')} /mi)`;
        } else {
            const [minutes, seconds] = document.getElementById('milePaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            const totalSeconds = (minutes * 60 + seconds) * 0.621371;
            const kmMinutes = Math.floor(totalSeconds / 60);
            const kmSeconds = Math.round(totalSeconds % 60);
            document.getElementById('milePaceKmEquiv').textContent = `(${kmMinutes}:${kmSeconds.toString().padStart(2, '0')} /km)`;
        }
    }

    function updateSpeeds() {
        // 实现更新速度显示的逻辑
    }

    // 生成速查表
    generatePaceTable();

    // 为选项卡切换添加事件监听器
    const tableTab = document.querySelector('[data-bs-target="#table"]');
    if (tableTab) {
        tableTab.addEventListener('shown.bs.tab', function () {
            generatePaceTable(); // 当切换到速查表选项卡时重新生成表格
        });
    }
});

function generatePaceTable() {
    console.log('Generating pace table...'); // 调试日志
    const paceTableBody = document.getElementById('paceTableBody');
    if (!paceTableBody) {
        console.error('Pace table body not found!');
        return;
    }

    // 更新表头单位
    const paceHeader = document.querySelector('th.fw-semibold');
    if (paceHeader) {
        paceHeader.textContent = `配速 ${isKm ? '/KM' : '/MI'}`;
    }

    // 清空现有内容
    paceTableBody.innerHTML = '';

    // 根据当前单位设置配速范围和间隔
    const paces = [];
    if (isKm) {
        // KM配速：从 9:00 到 2:45，每2秒一个间隔
        for (let minutes = 9; minutes >= 2; minutes--) {
            if (minutes === 9) {
                paces.push({ minutes: 9, seconds: 0 });
                continue;
            }
            
            if (minutes === 2) {
                for (let seconds = 58; seconds >= 45; seconds -= 2) {
                    paces.push({ minutes, seconds });
                }
                continue;
            }
            
            for (let seconds = 58; seconds >= 0; seconds -= 2) {
                paces.push({ minutes, seconds });
            }
        }
    } else {
        // MI配速：从 14:30 到 4:30，每4秒一个间隔
        for (let minutes = 14; minutes >= 4; minutes--) {
            if (minutes === 14) {
                for (let seconds = 28; seconds >= 0; seconds -= 4) {
                    paces.push({ minutes, seconds });
                }
            } else if (minutes === 4) {
                for (let seconds = 56; seconds >= 28; seconds -= 4) {
                    paces.push({ minutes, seconds });
                }
            } else {
                for (let seconds = 56; seconds >= 0; seconds -= 4) {
                    paces.push({ minutes, seconds });
                }
            }
        }
    }

    // 为每个配速计算对应的时间
    paces.forEach(pace => {
        const row = document.createElement('tr');
        
        // 配速列
        const paceCell = document.createElement('td');
        paceCell.className = 'px-3';
        paceCell.textContent = `${pace.minutes}:${pace.seconds.toString().padStart(2, '0')}`;
        row.appendChild(paceCell);

        const paceSeconds = pace.minutes * 60 + pace.seconds;
        const distances = {
            '5k': 5,
            '10k': 10,
            'halfMarathon': 21.0975,
            'marathon': 42.195
        };

        Object.entries(distances).forEach(([key, distance]) => {
            const timeCell = document.createElement('td');
            timeCell.className = 'px-3';

            let totalSeconds;
            if (isKm) {
                // KM模式：直接使用距离
                totalSeconds = paceSeconds * distance;
            } else {
                // MI模式：将距离转换为英里
                totalSeconds = paceSeconds * (distance / 1.609344);
            }
            
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.round(totalSeconds % 60);

            if (hours > 0) {
                timeCell.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                timeCell.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            row.appendChild(timeCell);
        });

        paceTableBody.appendChild(row);
    });

    console.log('Table generation complete');
}

// 修改 HTML 中的切换按钮样式
document.head.insertAdjacentHTML('beforeend', `
    <style>
        #unitToggle .position-relative {
            transition: background-color 0.3s ease;
        }
        #toggleButton {
            transition: transform 0.3s ease;
        }
    </style>
`);