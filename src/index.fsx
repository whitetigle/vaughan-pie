#r "../node_modules/fable-core/Fable.Core.dll"
#r "../packages/Vaughan/lib/net45/Vaughan.dll"

open Fable.Core
open Fable.Core.JsInterop
open Fable.Import
open System.Text.RegularExpressions

open Vaughan.Notes
open Vaughan.Chords
open Vaughan.Guitar
open Vaughan.GuitarTab
open Vaughan.ScaleHarmonizer
open Vaughan.Scales

module SonicPiConverter =
  let private replace f (r:string) (s:string) = 
    s.Replace(f,r)
  let convertNote note =
    (sprintf "%A" note) 
    |> (replace "Flat" "b" >> replace "Sharp" "s")

  let isMinor chord =
    Regex.IsMatch(chord,"Min",RegexOptions.IgnoreCase) 

  let extractNoteFromChord (chord:string) = 
    chord.Substring(0,1)
  let getTone chord = 
    let tone = if (isMinor chord) then "minor" else "major"
    tone
  let toChord chord = 
    sprintf "chord(:%s,:%s)" 
      (chord |> extractNoteFromChord) 
      (chord |> getTone)
  let toSonicPiNotation noteList =
    noteList 
    |> List.map convertNote

module Composer =   

  let Anatole = [
      ScaleDgrees.I
      ScaleDgrees.VI
      ScaleDgrees.II
      ScaleDgrees.V
    ] 
  let DyerMaker = [
    ScaleDgrees.I
    ScaleDgrees.VI
    ScaleDgrees.IV
    ScaleDgrees.V
  ] 
  let Otherside = [
    ScaleDgrees.I
    ScaleDgrees.VI
    ScaleDgrees.III
    ScaleDgrees.VII
  ] 
  let private getSonicChord chord degree = 
    chord
    |> triadsHarmonizer degree 
    |> name
    |> SonicPiConverter.toChord 

  let getChords suite baseChord = 
    suite 
    |> List.map( fun d -> d |> getSonicChord baseChord )

let s = createScale Ionian C
let chords = Composer.getChords Composer.Anatole s
