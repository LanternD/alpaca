document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const valueSpan = document.getElementById(this.id + 'Value');
            valueSpan.textContent = this.value;
        });
    });

    const paceMinutesInput = document.getElementById('paceMinutes');
    const paceSecondsInput = document.getElementById('paceSeconds');

    const timeInputs = {
        '800m': ['800mMinutes', '800mSeconds'],
        '5k': ['5kMinutes', '5kSeconds'],
        '10k': ['10kHours', '10kMinutes', '10kSeconds'],
        '20k': ['20kHours', '20kMinutes', '20kSeconds'],
        'halfMarathon': ['halfMarathonHours', 'halfMarathonMinutes', 'halfMarathonSeconds'],
        'marathon': ['marathonHours', 'marathonMinutes', 'marathonSeconds']
    };

    function calculatePace(totalSeconds, distance) {
        const paceInSeconds = totalSeconds / distance;
        const paceMinutes = Math.floor(paceInSeconds / 60);
        const paceSeconds = Math.round(paceInSeconds % 60);
        paceMinutesInput.value = paceMinutes;
        paceSecondsInput.value = paceSeconds;
    }

    // 添加单位切换功能
    const unitToggle = document.getElementById('unitToggle');
    const unitToggleMile = document.getElementById('unitToggleMile');
    const toggleButton = document.getElementById('toggleButton');
    const toggleButtonMile = document.getElementById('toggleButtonMile');
    const kmPace = document.getElementById('kmPace');
    const milePace = document.getElementById('milePace');
    let isKm = true;

    function handleToggle() {
        // 在切换前保存当前值
        const currentPaceMinutes = isKm ? 
            parseInt(paceMinutesInput.value, 10) : 
            parseInt(paceMilesMinutesInput.value, 10);
        const currentPaceSeconds = isKm ? 
            parseInt(paceSecondsInput.value, 10) : 
            parseInt(paceMilesSecondsInput.value, 10);
        
        // 计算另一个单位的配速
        const totalSeconds = currentPaceMinutes * 60 + currentPaceSeconds;
        let newTotalSeconds;
        
        if (isKm) {
            // 从公里切换到英里
            newTotalSeconds = totalSeconds / 0.621371;
        } else {
            // 从英里切换到公里
            newTotalSeconds = totalSeconds * 0.621371;
        }
        
        const newMinutes = Math.floor(newTotalSeconds / 60);
        const newSeconds = Math.round(newTotalSeconds % 60);

        isKm = !isKm;

        if (isKm) {
            toggleButton.classList.remove('translate-x-6');
            toggleButton.classList.add('translate-x-1');
            toggleButtonMile.classList.remove('translate-x-6');
            toggleButtonMile.classList.add('translate-x-1');
            kmPace.classList.remove('hidden');
            milePace.classList.add('hidden');
            unitToggle.classList.remove('bg-green-600');
            unitToggle.classList.add('bg-blue-600');
            unitToggleMile.classList.remove('bg-green-600');
            unitToggleMile.classList.add('bg-blue-600');
            
            // 设置公里配速的值
            paceMinutesInput.value = newMinutes;
            paceSecondsInput.value = newSeconds;
        } else {
            toggleButton.classList.remove('translate-x-1');
            toggleButton.classList.add('translate-x-6');
            toggleButtonMile.classList.remove('translate-x-1');
            toggleButtonMile.classList.add('translate-x-6');
            kmPace.classList.add('hidden');
            milePace.classList.remove('hidden');
            unitToggle.classList.remove('bg-blue-600');
            unitToggle.classList.add('bg-green-600');
            unitToggleMile.classList.remove('bg-blue-600');
            unitToggleMile.classList.add('bg-green-600');
            
            // 设置英里配速的值
            paceMilesMinutesInput.value = newMinutes;
            paceMilesSecondsInput.value = newSeconds;
        }
        
        updateAllTimes();
    }

    unitToggle.addEventListener('click', handleToggle);
    unitToggleMile.addEventListener('click', handleToggle);

    // 添加英里配速输入框的事件监听器
    const paceMilesMinutesInput = document.getElementById('paceMilesMinutes');
    const paceMilesSecondsInput = document.getElementById('paceMilesSeconds');

    paceMilesMinutesInput.addEventListener('input', () => updateTimes('pace'));
    paceMilesSecondsInput.addEventListener('input', () => updateTimes('pace'));

    function formatPaceTime(minutes, seconds) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateEquivalentPace() {
        if (isKm) {
            const kmMin = parseInt(paceMinutesInput.value, 10);
            const kmSec = parseInt(paceSecondsInput.value, 10);
            const totalSeconds = (kmMin * 60 + kmSec) / 0.621371;
            const mileMin = Math.floor(totalSeconds / 60);
            const mileSec = Math.round(totalSeconds % 60);
            document.getElementById('kmPaceMileEquiv').textContent = 
                `(${formatPaceTime(mileMin, mileSec)} /mi)`;
        } else {
            const mileMin = parseInt(paceMilesMinutesInput.value, 10);
            const mileSec = parseInt(paceMilesSecondsInput.value, 10);
            const totalSeconds = (mileMin * 60 + mileSec) * 0.621371;
            const kmMin = Math.floor(totalSeconds / 60);
            const kmSec = Math.round(totalSeconds % 60);
            document.getElementById('milePaceKmEquiv').textContent = 
                `(${formatPaceTime(kmMin, kmSec)} /km)`;
        }
    }

    function updateSpeeds() {
        let totalPaceSeconds;
        if (isKm) {
            const paceMinutes = parseInt(paceMinutesInput.value, 10);
            const paceSeconds = parseInt(paceSecondsInput.value, 10);
            totalPaceSeconds = paceMinutes * 60 + paceSeconds;
            
            // 计算速度
            // 配速是每公里用时(秒)，需要转换为速度
            const speedMS = (1000 / totalPaceSeconds).toFixed(2);  // m/s = 1000m / 秒数
            const speedKMH = (3600 / totalPaceSeconds).toFixed(1); // km/h = (3600秒/配速秒数)
            const speedMPH = (3600 / totalPaceSeconds / 1.609344).toFixed(2); // mile/h

            // 更新显示
            document.getElementById('kmPaceSpeedMS').textContent = `${speedMS} m/s`;
            document.getElementById('kmPaceSpeedKMH').textContent = `${speedKMH} km/h`;
            document.getElementById('kmPaceSpeedMPH').textContent = `${speedMPH} mi/h`;
        } else {
            const paceMilesMinutes = parseInt(paceMilesMinutesInput.value, 10);
            const paceMilesSeconds = parseInt(paceMilesSecondsInput.value, 10);
            totalPaceSeconds = paceMilesMinutes * 60 + paceMilesSeconds;
            
            // 计算速度 (从英里配速转换)
            const speedMPH = (3600 / totalPaceSeconds).toFixed(2); // mile/h
            const speedKMH = (3600 / totalPaceSeconds * 1.609344).toFixed(1); // km/h
            const speedMS = (1609.344 / totalPaceSeconds).toFixed(2);  // m/s = 1英里的米数/秒数

            // 更新显示
            document.getElementById('milePaceSpeedMS').textContent = `${speedMS} m/s`;
            document.getElementById('milePaceSpeedKMH').textContent = `${speedKMH} km/h`;
            document.getElementById('milePaceSpeedMPH').textContent = `${speedMPH} mi/h`;
        }
    }

    function updateTimes(changedKey) {
        const distances = {
            '800m': 0.8,
            '5k': 5,
            '10k': 10,
            '20k': 20,
            'halfMarathon': 21.0975,
            'marathon': 42.195
        };

        const totalSeconds = {};
        for (const [key, ids] of Object.entries(timeInputs)) {
            const hours = ids.length === 3 ? parseInt(document.getElementById(ids[0]).value, 10) : 0;
            const minutes = parseInt(document.getElementById(ids[ids.length - 2]).value, 10);
            const seconds = parseInt(document.getElementById(ids[ids.length - 1]).value, 10);
            totalSeconds[key] = hours * 3600 + minutes * 60 + seconds;
        }

        if (changedKey === 'pace') {
            let totalPaceSeconds;
            if (isKm) {
                const paceMinutes = parseInt(paceMinutesInput.value, 10);
                const paceSeconds = parseInt(paceSecondsInput.value, 10);
                totalPaceSeconds = paceMinutes * 60 + paceSeconds;
            } else {
                const paceMilesMinutes = parseInt(paceMilesMinutesInput.value, 10);
                const paceMilesSeconds = parseInt(paceMilesSecondsInput.value, 10);
                totalPaceSeconds = (paceMilesMinutes * 60 + paceMilesSeconds) * 0.621371;
            }

            for (const [key, distance] of Object.entries(distances)) {
                const newTotalSeconds = totalPaceSeconds * distance;
                const newHours = Math.floor(newTotalSeconds / 3600);
                const newMinutes = Math.floor((newTotalSeconds % 3600) / 60);
                const newSeconds = Math.round(newTotalSeconds % 60);

                const ids = timeInputs[key];
                if (ids.length === 3) {
                    document.getElementById(ids[0]).value = newHours;
                }
                document.getElementById(ids[ids.length - 2]).value = newMinutes;
                document.getElementById(ids[ids.length - 1]).value = newSeconds;
            }
        } else {
            const paceDistance = distances[changedKey];
            calculatePace(totalSeconds[changedKey], paceDistance);

            for (const [key, distance] of Object.entries(distances)) {
                if (key !== changedKey) {
                    const newTotalSeconds = totalSeconds[changedKey] * (distance / paceDistance);
                    const newHours = Math.floor(newTotalSeconds / 3600);
                    const newMinutes = Math.floor((newTotalSeconds % 3600) / 60);
                    const newSeconds = Math.round(newTotalSeconds % 60);

                    const ids = timeInputs[key];
                    if (ids.length === 3) {
                        document.getElementById(ids[0]).value = newHours;
                    }
                    document.getElementById(ids[ids.length - 2]).value = newMinutes;
                    document.getElementById(ids[ids.length - 1]).value = newSeconds;
                }
            }
        }

        updateEquivalentPace();
        updateSpeeds();
    }

    function updateAllTimes() {
        updateTimes('pace');
    }

    for (const [key, ids] of Object.entries(timeInputs)) {
        ids.forEach(id => {
            document.getElementById(id).addEventListener('input', () => updateTimes(key));
        });
    }

    // 添加输入验证和进位处理函数
    function handleTimeInput(input, nextInput = null, prevInput = null) {
        let value = parseInt(input.value, 10);
        
        // 处理空值或NaN
        if (isNaN(value)) {
            value = 0;
        }

        // 处理秒数进位
        if (input.id.toLowerCase().includes('seconds')) {
            if (value >= 60) {
                if (prevInput) {
                    let prevValue = parseInt(prevInput.value, 10) || 0;
                    prevInput.value = prevValue + Math.floor(value / 60);
                    value = value % 60;
                } else {
                    value = 59;
                }
            } else if (value < 0) {
                value = 0;
            }
        }

        // 处理分钟进位
        if (input.id.toLowerCase().includes('minutes')) {
            if (value >= 60 && nextInput) {
                let nextValue = parseInt(nextInput.value, 10) || 0;
                nextValue += Math.floor(value / 60);
                nextInput.value = nextValue;
                value = value % 60;
            } else if (value < 0) {
                value = 0;
            }
        }

        // 处理小时范围
        if (input.id.toLowerCase().includes('hours')) {
            if (value < 0) value = 0;
            if (value > 23) value = 23;
        }

        // 更新输入框的值
        input.value = value;

        // 触发时间更新
        const keyMatch = input.id.match(/^(\w+?)(Hours|Minutes|Seconds)/);
        if (keyMatch) {
            updateTimes(keyMatch[1].toLowerCase());
        } else if (input.id.includes('pace')) {
            updateTimes('pace');
        }
    }

    // 为所有时间输入框添加验证和进位处理
    for (const [key, ids] of Object.entries(timeInputs)) {
        ids.forEach((id, index) => {
            const input = document.getElementById(id);
            const nextInput = index > 0 ? document.getElementById(ids[index - 1]) : null;
            const prevInput = index < ids.length - 1 ? document.getElementById(ids[index + 1]) : null;
            
            input.addEventListener('input', () => {
                handleTimeInput(input, nextInput, prevInput);
            });
        });
    }

    // 为配速输入框添加验证和进位处理
    paceMinutesInput.addEventListener('input', () => {
        let value = parseInt(paceMinutesInput.value, 10);
        if (isNaN(value)) value = 5;
        if (value < 2) value = 2;
        if (value > 20) value = 20;
        paceMinutesInput.value = value;
        updateTimes('pace');
        updateSpeeds();
    });

    paceSecondsInput.addEventListener('input', () => {
        handleTimeInput(paceSecondsInput, null, paceMinutesInput);
        updateSpeeds();
    });

    paceMilesMinutesInput.addEventListener('input', () => {
        let value = parseInt(paceMilesMinutesInput.value, 10);
        if (isNaN(value)) value = 8;
        if (value < 3) value = 3;
        if (value > 32) value = 32;
        paceMilesMinutesInput.value = value;
        updateTimes('pace');
        updateSpeeds();
    });

    paceMilesSecondsInput.addEventListener('input', () => {
        handleTimeInput(paceMilesSecondsInput, null, paceMilesMinutesInput);
        updateSpeeds();
    });

    // 初始化等效配速显示
    updateEquivalentPace();
    updateSpeeds();
}); 