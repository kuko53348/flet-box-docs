// screens/RootScreen.js
import { Container, Column, Text, Button, Icon, colors, goTo } from 'flet-box';

export const RootScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
        child: Column({
            gap: 28,
            alignItems: 'center',
            children: [
                Container({
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    backgroundColor: colors.primary + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'rocket_launch', size: 48, color: colors.primary })
                }),
                Text({ 
                    text: 'FletBox', 
                    size: 36, 
                    weight: 'bold', 
                    color: colors.primary, 
                    align: 'center' 
                }),
                Text({ 
                    text: 'Ultra-lightweight UI framework for vanilla JavaScript', 
                    size: 14, 
                    color: colors.textSecondary, 
                    align: 'center' 
                }),
                Button({ 
                    text: 'Get Started →', 
                    iconRight: 'arrow_forward',
                    bgColor: colors.primary, 
                    color: '#ffffff', 
                    padding: '10px 28px',
                    onPress: () => goTo('/home') 
                })
            ]
        })
    });
};

export default RootScreen;
