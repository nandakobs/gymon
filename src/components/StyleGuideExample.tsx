import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors, utils, padding, margin, backgrounds, textColors, buttons, cards, combine } from '@/theme';

export function StyleGuideExample() {
  return (
    <ScrollView style={[utils.flex1, backgrounds.bgBackground]}>
      <View style={[padding.p4]}>
        

        <Text style={[utils.headingText, textColors.textDefault, margin.mb4]}>
          GymOn Style Guide
        </Text>


        <View style={[cards.base, margin.mb4]}>
          <Text style={[utils.bodyText, textColors.textDefault, margin.mb3]}>
            Brand Colors
          </Text>
          
          <View style={[utils.flexRow, utils.justifyBetween, margin.mb2]}>
            <View style={[{ width: 60, height: 40 }, backgrounds.bgPrimary, utils.roundedMd]} />
            <View style={[{ width: 60, height: 40 }, backgrounds.bgSecondary, utils.roundedMd]} />
            <View style={[{ width: 60, height: 40 }, backgrounds.bgAccent, utils.roundedMd]} />
            <View style={[{ width: 60, height: 40 }, backgrounds.bgSuccess, utils.roundedMd]} />
          </View>
          
          <View style={[utils.flexRow, utils.justifyBetween]}>
            <Text style={[utils.captionText, textColors.textMuted]}>Primary</Text>
            <Text style={[utils.captionText, textColors.textMuted]}>Secondary</Text>
            <Text style={[utils.captionText, textColors.textMuted]}>Accent</Text>
            <Text style={[utils.captionText, textColors.textMuted]}>Success</Text>
          </View>
        </View>


        <View style={[cards.base, margin.mb4]}>
          <Text style={[utils.bodyText, textColors.textDefault, margin.mb3]}>
            Typography Scale
          </Text>
          
          <Text style={[{ fontSize: 30, fontWeight: 'bold' }, textColors.textDefault, margin.mb1]}>
            Heading XL
          </Text>
          <Text style={[{ fontSize: 24, fontWeight: 'bold' }, textColors.textDefault, margin.mb1]}>
            Heading Large
          </Text>
          <Text style={[{ fontSize: 18, fontWeight: '600' }, textColors.textDefault, margin.mb1]}>
            Heading Medium
          </Text>
          <Text style={[{ fontSize: 16 }, textColors.textDefault, margin.mb1]}>
            Body Text
          </Text>
          <Text style={[{ fontSize: 14 }, textColors.textMuted]}>
            Caption Text
          </Text>
        </View>


        <View style={[cards.base, margin.mb4]}>
          <Text style={[utils.bodyText, textColors.textDefault, margin.mb3]}>
            Button Styles
          </Text>
          
          <TouchableOpacity style={[buttons.base, buttons.primary, margin.mb2]}>
            <Text style={[{ fontSize: 16, fontWeight: '600' }, textColors.textWhite]}>
              Primary Button
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[buttons.base, buttons.secondary, margin.mb2]}>
            <Text style={[{ fontSize: 16, fontWeight: '600' }, textColors.textDefault]}>
              Secondary Button
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[buttons.base, buttons.outline]}>
            <Text style={[{ fontSize: 16, fontWeight: '600' }, textColors.textPrimary]}>
              Outline Button
            </Text>
          </TouchableOpacity>
        </View>


        <View style={[cards.base, margin.mb4]}>
          <Text style={[utils.bodyText, textColors.textDefault, margin.mb3]}>
            Card Layouts
          </Text>
          
          <View style={[cards.elevated, margin.mb3]}>
            <Text style={[utils.bodyText, textColors.textDefault]}>Elevated Card</Text>
            <Text style={[utils.captionText, textColors.textMuted]}>
              This card has more shadow depth
            </Text>
          </View>
          
          <View style={[cards.base]}>
            <Text style={[utils.bodyText, textColors.textDefault]}>Base Card</Text>
            <Text style={[utils.captionText, textColors.textMuted]}>
              Standard card with subtle shadow
            </Text>
          </View>
        </View>


        <View style={[cards.base, margin.mb4]}>
          <Text style={[utils.bodyText, textColors.textDefault, margin.mb3]}>
            Spacing System
          </Text>
          
          <View style={[utils.flexRow, utils.itemsCenter, margin.mb2]}>
            <View style={[{ width: 16, height: 16 }, backgrounds.bgPrimary, margin.mr1]} />
            <Text style={[utils.captionText, textColors.textMuted]}>4px spacing</Text>
          </View>
          
          <View style={[utils.flexRow, utils.itemsCenter, margin.mb2]}>
            <View style={[{ width: 32, height: 16 }, backgrounds.bgPrimary, margin.mr1]} />
            <Text style={[utils.captionText, textColors.textMuted]}>8px spacing</Text>
          </View>
          
          <View style={[utils.flexRow, utils.itemsCenter]}>
            <View style={[{ width: 64, height: 16 }, backgrounds.bgPrimary, margin.mr1]} />
            <Text style={[utils.captionText, textColors.textMuted]}>16px spacing</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

export default StyleGuideExample;