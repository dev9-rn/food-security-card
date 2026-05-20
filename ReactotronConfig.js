import Reactotron from "reactotron-react-native";

Reactotron.configure({
    name: "Food Security Card",
}) // controls connection & communication settings
    .useReactNative({
        networking: {
            ignoreUrls: /symbolicate/ // and, of course, ignore symbolication requests. (default: true)
        }
    }) // add all built-in react native plugins
    .connect(); // let's connect!