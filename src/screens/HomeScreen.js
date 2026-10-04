// screens/HomeScreen.js
import { Container, Column, Text, Button, Icon, colors, goTo } from 'flet-box';

export const HomeScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background,
        child: Column({
            gap: 32,
            alignItems: 'center',
            children: [
                Container({
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    backgroundColor: colors.primary + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'rocket_launch', size: 56, color: colors.primary })
                }),
                Text({ 
                    text: 'Welcome to FletBox', 
                    size: 32, 
                    weight: 'bold', 
                    color: colors.text, 
                    align: 'center' 
                }),
                Text({ 
                    text: 'Choose a section to explore:', 
                    size: 16, 
                    color: colors.textSecondary, 
                    align: 'center' 
                }),
                Column({
                    gap: 12,
                    alignItems: 'stretch',
                    style: { width: '100%', maxWidth: 280 },
                    children: [
                        Button({ 
                            text: '🏠 Home', 
                            iconRight: 'arrow_forward',
                            bgColor: colors.primary, 
                            color: '#ffffff',
                            padding: '12px 20px',
                            fullWidth: true,
                            onPress: () => goTo('/home') 
                        }),
                        Button({ 
                            text: 'ℹ️ About', 
                            iconRight: 'arrow_forward',
                            variant: 'outlined',
                            color: colors.info,
                            padding: '12px 20px',
                            fullWidth: true,
                            onPress: () => goTo('/about') 
                        }),
                        Button({ 
                            text: '← Back to Root', 
                            iconLeft: 'arrow_back',
                            variant: 'text',
                            color: colors.textSecondary,
                            padding: '12px 20px',
                            fullWidth: true,
                            onPress: () => goTo('/') 
                        })
                    ]
                })
            ]
        })
    });
};

export default HomeScreen;
