# teendok

> teendok - calendar and tasks

## Usage

``` bash
# Install dependencies
npm install

# Build for production
tns build <platform> --bundle

# Build, watch for changes and debug the application
tns debug <platform> --bundle

# Build, watch for changes and run the application
tns run <platform> --bundle
```

# Plugins

npm install --save nativescript-ui-calendar

# Firebase
You need to configure Firebase for not to crash.
You can reconfigure the plugin by going to the node_modules/nativescript-plugin-firebase and running npm run config.
You have to disable most of the stuff, saving auth.
