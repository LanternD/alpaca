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
        '1k': ['1kMinutes', '1kSeconds'],
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

    function updateTimes(changedKey) {
        const distances = {
            '1k': 1,
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
            const paceMinutes = parseInt(paceMinutesInput.value, 10);
            const paceSeconds = parseInt(paceSecondsInput.value, 10);
            const totalPaceSeconds = paceMinutes * 60 + paceSeconds;

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
    }

    for (const [key, ids] of Object.entries(timeInputs)) {
        ids.forEach(id => {
            document.getElementById(id).addEventListener('input', () => updateTimes(key));
        });
    }

    paceMinutesInput.addEventListener('input', () => updateTimes('pace'));
    paceSecondsInput.addEventListener('input', () => updateTimes('pace'));
}); 