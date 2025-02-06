import PacePickerModal from './pacePickerModal.js';

document.addEventListener('DOMContentLoaded', function() {

    let isKm = true;

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
    const unitToggle = document.getElementById('unitToggle');
    const toggleButton = document.getElementById('toggleButton');
    const kmPace = document.getElementById('kmPace');
    const milePace = document.getElementById('milePace');

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
            toggleButton.style.transform = 'translateX(30px)';
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
            toggleButton.style.transform = 'translateX(0)';
            kmPace.style.display = 'block';
            milePace.style.display = 'none';
            
            // 更新公里配速显示
            document.getElementById('kmPaceDisplay').textContent = 
                `${kmMinutes}:${kmSeconds.toString().padStart(2, '0')}`;
        }

        // 切换单位标志
        isKm = !isKm;

        // 更新等效配速显示
        updateEquivalentPace();
        
        // 更新速度显示
        updateSpeeds();
    }

    // 添加点击和触摸事件监听
    if (unitToggle) {
        unitToggle.addEventListener('click', handleToggle);
        unitToggle.addEventListener('touchstart', (e) => {
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
            document.getElementById('kmPaceMileEquiv').textContent = 
                `(${mileMinutes}:${mileSeconds.toString().padStart(2, '0')} /mi)`;
        } else {
            const [minutes, seconds] = document.getElementById('milePaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            const totalSeconds = (minutes * 60 + seconds) * 0.621371;
            const kmMinutes = Math.floor(totalSeconds / 60);
            const kmSeconds = Math.round(totalSeconds % 60);
            document.getElementById('milePaceKmEquiv').textContent = 
                `(${kmMinutes}:${kmSeconds.toString().padStart(2, '0')} /km)`;
        }
    }

    function updateSpeeds() {
        let paceSeconds;
        if (isKm) {
            const [minutes, seconds] = document.getElementById('kmPaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            paceSeconds = minutes * 60 + seconds;
        } else {
            const [minutes, seconds] = document.getElementById('milePaceDisplay')
                .textContent.split(':').map(num => parseInt(num, 10));
            paceSeconds = (minutes * 60 + seconds) * 0.621371;
        }

        const speedMS = (1000 / paceSeconds).toFixed(2);
        const speedKMH = (3600 / paceSeconds).toFixed(1);
        const speedMPH = (3600 / paceSeconds / 1.609344).toFixed(2);

        const currentDisplay = isKm ? 'km' : 'mile';
        document.getElementById(`${currentDisplay}PaceSpeedMS`).textContent = speedMS;
        document.getElementById(`${currentDisplay}PaceSpeedKMH`).textContent = speedKMH;
        document.getElementById(`${currentDisplay}PaceSpeedMPH`).textContent = speedMPH;
    }

    // 生成速查表
    function generatePaceTable() {
        const paceTableBody = document.getElementById('paceTableBody');
        if (!paceTableBody) return;

        // 生成配速范围（从 9:00 到 2:45，每2秒一个间隔）
        const paces = [];
        for (let minutes = 9; minutes >= 2; minutes--) {
            // 如果是9分钟，只生成一个9:00的配速
            if (minutes === 9) {
                paces.push({ minutes: 9, seconds: 0 });
                continue;
            }
            
            // 如果是2分钟，只生成2:45及以后的配速
            if (minutes === 2) {
                for (let seconds = 58; seconds >= 45; seconds -= 2) {
                    paces.push({ minutes, seconds });
                }
                continue;
            }
            
            // 其他分钟，每2秒生成一个配速
            for (let seconds = 58; seconds >= 0; seconds -= 2) {
                paces.push({ minutes, seconds });
            }
        }

        // 为每个配速计算对应的时间
        paces.forEach(pace => {
            const totalSeconds = pace.minutes * 60 + pace.seconds;
            const row = document.createElement('tr');
            
            // 配速列
            const paceCell = document.createElement('td');
            paceCell.textContent = `${pace.minutes}:${pace.seconds.toString().padStart(2, '0')}`;
            row.appendChild(paceCell);

            // 计算各个距离的时间
            const distances = {
                '5k': 5,
                '10k': 10,
                'halfMarathon': 21.0975,
                'marathon': 42.195
            };

            Object.values(distances).forEach(distance => {
                const timeSeconds = totalSeconds * distance;
                const hours = Math.floor(timeSeconds / 3600);
                const minutes = Math.floor((timeSeconds % 3600) / 60);
                const seconds = Math.round(timeSeconds % 60);

                const timeCell = document.createElement('td');
                if (hours > 0) {
                    timeCell.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    timeCell.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
                row.appendChild(timeCell);
            });

            paceTableBody.appendChild(row);
        });
    }

    // 调用生成速查表函数
    generatePaceTable();

    // 初始化显示
    updateTimes();
}); 