(function(global) {
    var theme = null;

    DarkReader.setFetchMethod(
        window.fetch
    )

    function setTheme(value) {
        if (value === 'dark') {
            DarkReader.enable({
                brightness: 100,
                contrast: 90,
                sepia: 10,
            });
        } else {
            DarkReader.disable();
        }

        theme = value;
        localStorage.setItem('wik-theme', value);
    }
    
    function toggleDarkTheme(event) {
        const prev = theme;
        setTheme(theme === 'dark' ? 'light' : 'dark');
        const elementClass = event.target.classList;
        prev && elementClass.remove(prev);
        elementClass.add(theme);
    }

    setTheme(localStorage.getItem('wik-theme'));

    global.toggleDarkTheme = toggleDarkTheme;
}(window));

